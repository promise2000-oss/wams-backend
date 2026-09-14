"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLeaveTypes = listLeaveTypes;
exports.createLeaveType = createLeaveType;
exports.updateLeaveType = updateLeaveType;
exports.getLeaveBalance = getLeaveBalance;
exports.listLeaveRequests = listLeaveRequests;
exports.createLeaveRequest = createLeaveRequest;
exports.approveLeaveRequest = approveLeaveRequest;
exports.rejectLeaveRequest = rejectLeaveRequest;
exports.bulkApproveLeave = bulkApproveLeave;
exports.listDelegates = listDelegates;
exports.createDelegate = createDelegate;
exports.removeDelegate = removeDelegate;
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
const audit_service_1 = require("../audit/audit.service");
// ── Leave Types ──
async function listLeaveTypes(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const where = { organizationId: req.user.organizationId };
    const [total, types] = await Promise.all([
        prisma_1.default.leaveType.count({ where }),
        prisma_1.default.leaveType.findMany({ where, orderBy: { name: 'asc' }, skip, take: pageSize }),
    ]);
    const formatted = types.map((t) => ({
        id: t.id,
        organization_id: t.organizationId,
        name: t.name,
        description: t.description,
        days_per_year: t.defaultDays,
        accrual_policy: t.accrualPolicy,
        carry_over_max_days: t.carryOverMaxDays,
        is_active: t.status === 'ACTIVE',
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
    }));
    res.json((0, pagination_1.paginatedResponse)(formatted, total, page, pageSize));
}
async function createLeaveType(req, res) {
    const { name, description, days_per_year, accrual_policy, carry_over_max_days } = req.body;
    const type = await prisma_1.default.leaveType.create({
        data: {
            organizationId: req.user.organizationId,
            name,
            description,
            defaultDays: days_per_year || 0,
            accrualPolicy: accrual_policy || undefined,
            carryOverMaxDays: carry_over_max_days || 0,
            status: 'ACTIVE',
        },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CREATE', 'LeaveType', type.id);
    res.status(201).json({
        id: type.id,
        organization_id: type.organizationId,
        name: type.name,
        description: type.description,
        days_per_year: type.defaultDays,
        accrual_policy: type.accrualPolicy,
        carry_over_max_days: type.carryOverMaxDays,
        is_active: type.status === 'ACTIVE',
        created_at: type.created_at.toISOString(),
        updated_at: type.updated_at.toISOString(),
    });
}
async function updateLeaveType(req, res) {
    const { name, description, days_per_year, accrual_policy, carry_over_max_days, is_active } = req.body;
    const existing = await prisma_1.default.leaveType.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!existing) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Leave type not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.leaveType.update({
        where: { id: String(req.params.id) },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(days_per_year !== undefined && { defaultDays: days_per_year }),
            ...(accrual_policy !== undefined && { accrualPolicy: accrual_policy }),
            ...(carry_over_max_days !== undefined && { carryOverMaxDays: carry_over_max_days }),
            ...(is_active !== undefined && { status: is_active ? 'ACTIVE' : 'INACTIVE' }),
        },
    });
    res.json({
        id: updated.id,
        name: updated.name,
        days_per_year: updated.defaultDays,
        is_active: updated.status === 'ACTIVE',
    });
}
// ── Leave Balances ──
async function getLeaveBalance(req, res) {
    const { employeeId } = req.query;
    const targetUserId = employeeId || req.user.id;
    const currentYear = new Date().getFullYear();
    const balances = await prisma_1.default.leaveBalance.findMany({
        where: {
            employeeId: targetUserId,
            periodYear: currentYear,
        },
        include: { leaveType: true },
    });
    const formatted = balances.map((b) => ({
        id: b.id,
        organization_id: req.user.organizationId,
        employee_id: b.employeeId,
        leave_type_id: b.leaveTypeId,
        leave_type_name: b.leaveType.name,
        year: b.periodYear,
        total_days: b.allocatedDays,
        used_days: b.usedDays,
        pending_days: 0,
        carried_over_days: 0,
        accrued_days: b.allocatedDays - b.usedDays,
        updated_at: b.updatedAt.toISOString(),
    }));
    res.json(formatted);
}
// ── Leave Requests ──
async function listLeaveRequests(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const { status, employeeId } = req.query;
    const where = {
        organizationId: req.user.organizationId,
    };
    if (req.user.role === 'EMPLOYEE') {
        where.employeeId = req.user.id;
    }
    else if (employeeId) {
        where.employeeId = employeeId;
    }
    if (status)
        where.status = status;
    const [total, requests] = await Promise.all([
        prisma_1.default.leaveRequest.count({ where }),
        prisma_1.default.leaveRequest.findMany({
            where,
            include: { employee: true, leaveType: true, approver: true },
            orderBy: { created_at: 'desc' },
            skip,
            take: pageSize,
        }),
    ]);
    const formatted = requests.map((r) => ({
        id: r.id,
        organization_id: r.organizationId,
        employee_id: r.employeeId,
        employee_name: r.employee.name,
        leave_type_id: r.leaveTypeId,
        leave_type_name: r.leaveType.name,
        start_date: r.startDate.toISOString().split('T')[0],
        end_date: r.endDate.toISOString().split('T')[0],
        is_half_day: r.isHalfDay,
        half_day_period: r.halfDayPeriod,
        reason: r.reason,
        document_url: r.documentUrl,
        status: r.status,
        approved_by: r.approvedById,
        approved_by_name: r.approver?.name,
        rejection_reason: r.rejectionReason,
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
    }));
    res.json((0, pagination_1.paginatedResponse)(formatted, total, page, pageSize));
}
async function createLeaveRequest(req, res) {
    const { leave_type_id, start_date, end_date, is_half_day, half_day_period, reason, document_url } = req.body;
    const leaveType = await prisma_1.default.leaveType.findFirst({
        where: { id: leave_type_id, organizationId: req.user.organizationId },
    });
    if (!leaveType) {
        return res.status(404).json({
            error: { code: 'LEAVE_TYPE_NOT_FOUND', message: 'Leave type not found', requestId: req.requestId },
        });
    }
    // Calculate days
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days = is_half_day ? 0.5 : diffDays;
    // Check for overlapping approved/pending leave
    const overlapping = await prisma_1.default.leaveRequest.findFirst({
        where: {
            employeeId: req.user.id,
            status: { in: ['PENDING', 'APPROVED'] },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        },
    });
    if (overlapping) {
        return res.status(409).json({
            error: { code: 'OVERLAPPING_LEAVE', message: 'You already have an approved or pending leave request for this period', requestId: req.requestId },
        });
    }
    const request = await prisma_1.default.leaveRequest.create({
        data: {
            organizationId: req.user.organizationId,
            employeeId: req.user.id,
            leaveTypeId: leave_type_id,
            startDate,
            endDate,
            isHalfDay: is_half_day || false,
            halfDayPeriod: half_day_period || null,
            days,
            reason,
            documentUrl: document_url,
            status: 'PENDING',
        },
        include: { employee: true, leaveType: true },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CREATE', 'LeaveRequest', request.id);
    res.status(201).json({
        id: request.id,
        organization_id: request.organizationId,
        employee_id: request.employeeId,
        employee_name: request.employee.name,
        leave_type_id: request.leaveTypeId,
        leave_type_name: request.leaveType.name,
        start_date: request.startDate.toISOString().split('T')[0],
        end_date: request.endDate.toISOString().split('T')[0],
        is_half_day: request.isHalfDay,
        half_day_period: request.halfDayPeriod,
        reason: request.reason,
        document_url: request.documentUrl,
        status: request.status,
        created_at: request.created_at.toISOString(),
        updated_at: request.updated_at.toISOString(),
    });
}
async function approveLeaveRequest(req, res) {
    const request = await prisma_1.default.leaveRequest.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
        include: { employee: true },
    });
    if (!request) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Leave request not found', requestId: req.requestId },
        });
    }
    if (request.status !== 'PENDING') {
        return res.status(400).json({
            error: { code: 'INVALID_STATUS', message: 'Can only approve pending requests', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.leaveRequest.update({
        where: { id: String(req.params.id) },
        data: {
            status: 'APPROVED',
            approvedById: req.user.id,
            reviewedAt: new Date(),
        },
        include: { employee: true, leaveType: true, approver: true },
    });
    // Update leave balance
    const currentYear = new Date().getFullYear();
    const balance = await prisma_1.default.leaveBalance.findFirst({
        where: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            periodYear: currentYear,
        },
    });
    if (balance) {
        await prisma_1.default.leaveBalance.update({
            where: { id: balance.id },
            data: { usedDays: balance.usedDays + request.days },
        });
    }
    await (0, audit_service_1.auditFromRequest)(req, 'APPROVE', 'LeaveRequest', updated.id);
    res.json({
        id: updated.id,
        status: updated.status,
        approved_by: updated.approvedById,
        approved_by_name: updated.approver?.name,
        reviewed_at: updated.reviewedAt?.toISOString(),
    });
}
async function rejectLeaveRequest(req, res) {
    const { reason } = req.body;
    const request = await prisma_1.default.leaveRequest.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
    });
    if (!request) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Leave request not found', requestId: req.requestId },
        });
    }
    if (request.status !== 'PENDING') {
        return res.status(400).json({
            error: { code: 'INVALID_STATUS', message: 'Can only reject pending requests', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.leaveRequest.update({
        where: { id: String(req.params.id) },
        data: {
            status: 'REJECTED',
            approvedById: req.user.id,
            rejectionReason: reason,
            reviewedAt: new Date(),
        },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'REJECT', 'LeaveRequest', updated.id);
    res.json({ id: updated.id, status: updated.status });
}
async function bulkApproveLeave(req, res) {
    const { ids } = req.body;
    const requests = await prisma_1.default.leaveRequest.findMany({
        where: {
            id: { in: ids },
            organizationId: req.user.organizationId,
            status: 'PENDING',
        },
    });
    const updated = await prisma_1.default.leaveRequest.updateMany({
        where: { id: { in: requests.map((r) => r.id) } },
        data: {
            status: 'APPROVED',
            approvedById: req.user.id,
            reviewedAt: new Date(),
        },
    });
    res.json({ approved: updated.count });
}
// ── Leave Delegates ──
async function listDelegates(req, res) {
    const delegates = await prisma_1.default.leaveApproverDelegate.findMany({
        where: { managerId: req.user.id },
    });
    res.json(delegates);
}
async function createDelegate(req, res) {
    const { delegate_id, start_date, end_date } = req.body;
    const delegate = await prisma_1.default.leaveApproverDelegate.create({
        data: {
            managerId: req.user.id,
            delegateId: delegate_id,
            startDate: new Date(start_date),
            endDate: new Date(end_date),
        },
    });
    res.status(201).json(delegate);
}
async function removeDelegate(req, res) {
    await prisma_1.default.leaveApproverDelegate.deleteMany({
        where: { id: String(req.params.id), managerId: req.user.id },
    });
    res.status(204).send();
}
//# sourceMappingURL=leave.service.js.map