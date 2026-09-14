"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDepartments = listDepartments;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
const audit_service_1 = require("../audit/audit.service");
function formatDepartment(dept) {
    return {
        id: dept.id,
        organization_id: dept.organizationId,
        name: dept.name,
        description: dept.description,
        manager_id: dept.managerId,
        employee_count: dept._count?.users,
        created_at: dept.created_at.toISOString(),
        updated_at: dept.updated_at.toISOString(),
    };
}
async function listDepartments(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const where = {
        organizationId: req.user.organizationId,
    };
    const [total, departments] = await Promise.all([
        prisma_1.default.department.count({ where }),
        prisma_1.default.department.findMany({
            where,
            include: { _count: { select: { users: true } } },
            orderBy: { name: 'asc' },
            skip,
            take: pageSize,
        }),
    ]);
    res.json((0, pagination_1.paginatedResponse)(departments.map(formatDepartment), total, page, pageSize));
}
async function createDepartment(req, res) {
    const { name, description, managerId } = req.body;
    const existing = await prisma_1.default.department.findFirst({
        where: { name, organizationId: req.user.organizationId },
    });
    if (existing) {
        return res.status(409).json({
            error: { code: 'DUPLICATE', message: 'A department with this name already exists', requestId: req.requestId },
        });
    }
    const department = await prisma_1.default.department.create({
        data: {
            organizationId: req.user.organizationId,
            name,
            description,
            managerId,
        },
        include: { _count: { select: { users: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CREATE', 'Department', department.id, undefined, formatDepartment(department));
    res.status(201).json(formatDepartment(department));
}
async function updateDepartment(req, res) {
    const { name, description, managerId } = req.body;
    const existing = await prisma_1.default.department.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Department not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.department.update({
        where: { id: String(req.params.id) },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(managerId !== undefined && { managerId }),
        },
        include: { _count: { select: { users: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'UPDATE', 'Department', updated.id, formatDepartment(existing), formatDepartment(updated));
    res.json(formatDepartment(updated));
}
//# sourceMappingURL=department.service.js.map