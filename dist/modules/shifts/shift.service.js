"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShifts = listShifts;
exports.getShift = getShift;
exports.createShift = createShift;
exports.updateShift = updateShift;
exports.archiveShift = archiveShift;
exports.listShiftAssignments = listShiftAssignments;
exports.createShiftAssignment = createShiftAssignment;
exports.getShiftChangeHistory = getShiftChangeHistory;
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
const audit_service_1 = require("../audit/audit.service");
function formatShift(shift) {
    return {
        id: shift.id,
        organization_id: shift.organizationId,
        name: shift.name,
        start_time: shift.startTime,
        end_time: shift.endTime,
        grace_period_minutes: shift.gracePeriodMinutes,
        break_duration_minutes: shift.breakDurationMinutes,
        working_days: shift.workingDays.split(',').map(Number),
        overtime_rules: shift.overtimeRules,
        status: shift.status,
        employee_count: shift._count?.shiftAssignments,
        created_at: shift.created_at.toISOString(),
        updated_at: shift.updated_at.toISOString(),
    };
}
async function listShifts(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const where = { organizationId: req.user.organizationId };
    const [total, shifts] = await Promise.all([
        prisma_1.default.shift.count({ where }),
        prisma_1.default.shift.findMany({
            where,
            include: { _count: { select: { shiftAssignments: true } } },
            orderBy: { name: 'asc' },
            skip,
            take: pageSize,
        }),
    ]);
    res.json((0, pagination_1.paginatedResponse)(shifts.map(formatShift), total, page, pageSize));
}
async function getShift(req, res) {
    const shift = await prisma_1.default.shift.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
        include: { _count: { select: { shiftAssignments: true } } },
    });
    if (!shift) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Shift not found', requestId: req.requestId },
        });
    }
    res.json(formatShift(shift));
}
async function createShift(req, res) {
    const { name, start_time, end_time, grace_period_minutes, break_duration_minutes, working_days, overtime_rules } = req.body;
    const shift = await prisma_1.default.shift.create({
        data: {
            organizationId: req.user.organizationId,
            name,
            startTime: start_time,
            endTime: end_time,
            gracePeriodMinutes: grace_period_minutes || 0,
            breakDurationMinutes: break_duration_minutes || 0,
            workingDays: (working_days || [1, 2, 3, 4, 5]).join(','),
            overtimeRules: overtime_rules || undefined,
            status: 'ACTIVE',
        },
        include: { _count: { select: { shiftAssignments: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CREATE', 'Shift', shift.id, undefined, formatShift(shift));
    res.status(201).json(formatShift(shift));
}
async function updateShift(req, res) {
    const { name, start_time, end_time, grace_period_minutes, break_duration_minutes, working_days, overtime_rules } = req.body;
    const existing = await prisma_1.default.shift.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Shift not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.shift.update({
        where: { id: String(req.params.id) },
        data: {
            ...(name !== undefined && { name }),
            ...(start_time !== undefined && { startTime: start_time }),
            ...(end_time !== undefined && { endTime: end_time }),
            ...(grace_period_minutes !== undefined && { gracePeriodMinutes: grace_period_minutes }),
            ...(break_duration_minutes !== undefined && { breakDurationMinutes: break_duration_minutes }),
            ...(working_days !== undefined && { workingDays: working_days.join(',') }),
            ...(overtime_rules !== undefined && { overtimeRules: overtime_rules }),
        },
        include: { _count: { select: { shiftAssignments: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'UPDATE', 'Shift', updated.id, formatShift(existing), formatShift(updated));
    res.json(formatShift(updated));
}
async function archiveShift(req, res) {
    const existing = await prisma_1.default.shift.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Shift not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.shift.update({
        where: { id: String(req.params.id) },
        data: { status: 'ARCHIVED' },
        include: { _count: { select: { shiftAssignments: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'ARCHIVE', 'Shift', updated.id, formatShift(existing), formatShift(updated));
    res.json(formatShift(updated));
}
async function listShiftAssignments(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const { shiftId, employeeId } = req.query;
    const where = {
        organizationId: req.user.organizationId,
    };
    if (shiftId)
        where.shiftId = shiftId;
    if (employeeId)
        where.employeeId = employeeId;
    const [total, assignments] = await Promise.all([
        prisma_1.default.shiftAssignment.count({ where }),
        prisma_1.default.shiftAssignment.findMany({
            where,
            include: { shift: true, employee: true },
            orderBy: { created_at: 'desc' },
            skip,
            take: pageSize,
        }),
    ]);
    const formatted = assignments.map((a) => ({
        id: a.id,
        organization_id: a.organizationId,
        shift_id: a.shiftId,
        employee_id: a.employeeId,
        employee_name: a.employee.name,
        shift_name: a.shift.name,
        effective_from: a.effectiveFrom.toISOString().split('T')[0],
        effective_to: a.effectiveTo?.toISOString().split('T')[0] || null,
        created_at: a.created_at.toISOString(),
    }));
    res.json((0, pagination_1.paginatedResponse)(formatted, total, page, pageSize));
}
async function createShiftAssignment(req, res) {
    const { shift_id, employee_id, effective_from, effective_to } = req.body;
    // Check for overlapping assignments
    const overlapping = await prisma_1.default.shiftAssignment.findFirst({
        where: {
            employeeId: employee_id,
            organizationId: req.user.organizationId,
            OR: [
                {
                    effectiveFrom: { lte: new Date(effective_to || '9999-12-31') },
                    effectiveTo: { gte: new Date(effective_from) },
                },
                {
                    effectiveFrom: { lte: new Date(effective_to || '9999-12-31') },
                    effectiveTo: null,
                },
            ],
        },
    });
    if (overlapping) {
        return res.status(409).json({
            error: { code: 'OVERLAPPING_ASSIGNMENT', message: 'Employee already has an active shift assignment for this period', requestId: req.requestId },
        });
    }
    const assignment = await prisma_1.default.shiftAssignment.create({
        data: {
            organizationId: req.user.organizationId,
            shiftId: shift_id,
            employeeId: employee_id,
            effectiveFrom: new Date(effective_from),
            effectiveTo: effective_to ? new Date(effective_to) : null,
        },
        include: { shift: true, employee: true },
    });
    res.status(201).json({
        id: assignment.id,
        organization_id: assignment.organizationId,
        shift_id: assignment.shiftId,
        employee_id: assignment.employeeId,
        employee_name: assignment.employee.name,
        shift_name: assignment.shift.name,
        effective_from: assignment.effectiveFrom.toISOString().split('T')[0],
        effective_to: assignment.effectiveTo?.toISOString().split('T')[0] || null,
        created_at: assignment.created_at.toISOString(),
    });
}
async function getShiftChangeHistory(req, res) {
    // For MVP, we track shifts via assignment history
    const assignments = await prisma_1.default.shiftAssignment.findMany({
        where: {
            employeeId: String(req.params.employeeId),
            organizationId: req.user.organizationId,
        },
        include: { shift: true },
        orderBy: { effectiveFrom: 'desc' },
    });
    const changes = assignments.map((a, idx) => ({
        id: a.id,
        employee_id: a.employeeId,
        new_shift_id: a.shiftId,
        new_shift_name: a.shift.name,
        effective_date: a.effectiveFrom.toISOString().split('T')[0],
        created_at: a.created_at.toISOString(),
    }));
    res.json(changes);
}
//# sourceMappingURL=shift.service.js.map