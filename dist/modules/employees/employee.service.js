"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmployees = listEmployees;
exports.getEmployee = getEmployee;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.deactivateEmployee = deactivateEmployee;
exports.reactivateEmployee = reactivateEmployee;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
const audit_service_1 = require("../audit/audit.service");
const BCRYPT_COST = 12;
function formatUser(user) {
    return {
        id: user.id,
        organization_id: user.organizationId,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        employee_id: user.employeeId,
        department_id: user.departmentId,
        manager_id: user.managerId,
        shift_id: user.shiftId,
        position: user.position,
        employment_status: user.status,
        date_joined: user.dateJoined?.toISOString() || null,
        avatar_url: user.avatarUrl,
        department_name: user.department?.name,
        manager_name: user.manager?.name,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
    };
}
async function listEmployees(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const { departmentId, shiftId, status, search } = (0, pagination_1.parseFilters)(req);
    const where = {
        organizationId: req.user.organizationId,
    };
    if (departmentId)
        where.departmentId = departmentId;
    if (shiftId)
        where.shiftId = shiftId;
    if (status)
        where.status = status;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { employeeId: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [total, users] = await Promise.all([
        prisma_1.default.user.count({ where }),
        prisma_1.default.user.findMany({
            where,
            include: { department: true, manager: true },
            orderBy: { name: 'asc' },
            skip,
            take: pageSize,
        }),
    ]);
    res.json((0, pagination_1.paginatedResponse)(users.map(formatUser), total, page, pageSize));
}
async function getEmployee(req, res) {
    const user = await prisma_1.default.user.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
        include: { department: true, manager: true },
    });
    if (!user) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
        });
    }
    res.json(formatUser(user));
}
async function createEmployee(req, res) {
    const { name, email, password, role, phone, departmentId, managerId, shiftId, position } = req.body;
    const existingUser = await prisma_1.default.user.findFirst({
        where: { email, organizationId: req.user.organizationId },
    });
    if (existingUser) {
        return res.status(409).json({
            error: { code: 'EMAIL_EXISTS', message: 'A user with this email already exists', requestId: req.requestId },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(password || 'changeme123', BCRYPT_COST);
    const user = await prisma_1.default.user.create({
        data: {
            organizationId: req.user.organizationId,
            name,
            email,
            passwordHash,
            role: role || 'EMPLOYEE',
            phone,
            departmentId,
            managerId,
            shiftId,
            position,
            status: 'ACTIVE',
        },
        include: { department: true, manager: true },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CREATE', 'Employee', user.id, undefined, formatUser(user));
    res.status(201).json(formatUser(user));
}
async function updateEmployee(req, res) {
    const { name, email, role, phone, departmentId, managerId, shiftId, position } = req.body;
    const existing = await prisma_1.default.user.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.user.update({
        where: { id: String(req.params.id) },
        data: {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(role !== undefined && { role }),
            ...(phone !== undefined && { phone }),
            ...(departmentId !== undefined && { departmentId }),
            ...(managerId !== undefined && { managerId }),
            ...(shiftId !== undefined && { shiftId }),
            ...(position !== undefined && { position }),
        },
        include: { department: true, manager: true },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'UPDATE', 'Employee', updated.id, formatUser(existing), formatUser(updated));
    res.json(formatUser(updated));
}
async function deactivateEmployee(req, res) {
    const existing = await prisma_1.default.user.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.user.update({
        where: { id: String(req.params.id) },
        data: { status: 'DEACTIVATED' },
        include: { department: true, manager: true },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'DEACTIVATE', 'Employee', updated.id, formatUser(existing), formatUser(updated));
    res.json(formatUser(updated));
}
async function reactivateEmployee(req, res) {
    const existing = await prisma_1.default.user.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.user.update({
        where: { id: String(req.params.id) },
        data: { status: 'ACTIVE' },
        include: { department: true, manager: true },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'REACTIVATE', 'Employee', updated.id, formatUser(existing), formatUser(updated));
    res.json(formatUser(updated));
}
//# sourceMappingURL=employee.service.js.map