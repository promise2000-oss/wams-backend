"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clockIn = clockIn;
exports.clockOut = clockOut;
exports.getTodayStatus = getTodayStatus;
exports.getAttendanceHistory = getAttendanceHistory;
exports.submitCorrection = submitCorrection;
exports.getCorrections = getCorrections;
exports.reviewCorrection = reviewCorrection;
exports.getTeamLive = getTeamLive;
const luxon_1 = require("luxon");
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
const audit_service_1 = require("../audit/audit.service");
const rules_engine_1 = require("./rules-engine");
const rules_engine_2 = require("./rules-engine");
function formatAttendance(record) {
    return {
        id: record.id,
        organization_id: record.organizationId,
        employee_id: record.employeeId,
        employee_name: record.employee?.name,
        shift_id: record.shiftId,
        shift_name: record.shift?.name,
        work_date: record.workDate.toISOString().split('T')[0],
        clock_in: record.clockIn?.toISOString() || null,
        clock_out: record.clockOut?.toISOString() || null,
        scheduled_start: record.scheduledStart?.toISOString(),
        scheduled_end: record.scheduledEnd?.toISOString(),
        late_minutes: record.lateMinutes,
        early_departure_minutes: record.earlyDepartureMinutes,
        worked_minutes: record.workedMinutes,
        overtime_minutes: record.overtimeMinutes,
        break_minutes: record.shift?.breakDurationMinutes || 0,
        status: record.status,
        source: record.source,
        notes: record.notes,
        department_name: record.employee?.department?.name,
        created_at: record.created_at.toISOString(),
        updated_at: record.updated_at.toISOString(),
    };
}
async function clockIn(req, res) {
    const userId = req.user.id;
    const now = luxon_1.DateTime.utc();
    const employee = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { shift: true, department: true },
    });
    if (!employee?.shiftId) {
        return res.status(400).json({
            error: { code: 'NO_SHIFT', message: 'No shift assigned. Please contact your manager.', requestId: req.requestId },
        });
    }
    const shift = employee.shift;
    const org = await prisma_1.default.organization.findUnique({ where: { id: req.user.organizationId } });
    const timezone = org?.timezone || 'Africa/Lagos';
    const nowInTz = now.setZone(timezone);
    const crossesMidnight = (0, rules_engine_1.doesShiftCrossMidnight)(shift.startTime, shift.endTime);
    const workDate = nowInTz.toISODate();
    // Check if already clocked in
    const existing = await prisma_1.default.attendance.findUnique({
        where: { employeeId_workDate: { employeeId: userId, workDate: new Date(workDate) } },
    });
    if (existing?.clockIn) {
        return res.status(409).json({
            error: { code: 'ALREADY_CLOCKED_IN', message: 'You have already clocked in today.', requestId: req.requestId },
        });
    }
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const scheduledStart = luxon_1.DateTime.fromISO(workDate).setZone(timezone).set({ hour: startH, minute: startM, second: 0, millisecond: 0 });
    const [endH, endM] = shift.endTime.split(':').map(Number);
    let scheduledEnd = luxon_1.DateTime.fromISO(workDate).setZone(timezone).set({ hour: endH, minute: endM, second: 0, millisecond: 0 });
    if (crossesMidnight) {
        scheduledEnd = scheduledEnd.plus({ days: 1 });
    }
    const clockInResult = (0, rules_engine_2.evaluateClockIn)({
        scheduledStart,
        gracePeriodMinutes: shift.gracePeriodMinutes,
        actualClockIn: now,
    });
    // Check for approved leave
    const approvedLeave = await prisma_1.default.leaveRequest.findFirst({
        where: {
            employeeId: userId,
            status: 'APPROVED',
            startDate: { lte: new Date(workDate) },
            endDate: { gte: new Date(workDate) },
        },
    });
    const isWorkingDay = nowInTz.weekday % 7 === 0 ? shift.workingDays.includes('0') : shift.workingDays.includes(String(nowInTz.weekday % 7));
    const status = (0, rules_engine_2.resolveDailyStatus)({
        hasApprovedLeave: !!approvedLeave,
        isHoliday: false,
        isWorkingDay,
        clockInResult,
    });
    const attendance = await prisma_1.default.attendance.create({
        data: {
            organizationId: req.user.organizationId,
            employeeId: userId,
            shiftId: shift.id,
            workDate: new Date(workDate),
            clockIn: now.toJSDate(),
            scheduledStart: scheduledStart.toJSDate(),
            scheduledEnd: scheduledEnd.toJSDate(),
            lateMinutes: clockInResult.lateMinutes,
            earlyDepartureMinutes: 0,
            workedMinutes: 0,
            overtimeMinutes: 0,
            status: status,
            source: 'CLOCK',
            notes: req.body.notes,
        },
        include: { shift: true, employee: { include: { department: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CLOCK_IN', 'Attendance', attendance.id);
    res.status(201).json(formatAttendance(attendance));
}
async function clockOut(req, res) {
    const userId = req.user.id;
    const now = luxon_1.DateTime.utc();
    const employee = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { shift: true, department: true },
    });
    if (!employee?.shiftId) {
        return res.status(400).json({
            error: { code: 'NO_SHIFT', message: 'No shift assigned.', requestId: req.requestId },
        });
    }
    const shift = employee.shift;
    const org = await prisma_1.default.organization.findUnique({ where: { id: req.user.organizationId } });
    const timezone = org?.timezone || 'Africa/Lagos';
    const nowInTz = now.setZone(timezone);
    const workDate = nowInTz.toISODate();
    const attendance = await prisma_1.default.attendance.findUnique({
        where: { employeeId_workDate: { employeeId: userId, workDate: new Date(workDate) } },
        include: { shift: true },
    });
    if (!attendance) {
        return res.status(404).json({
            error: { code: 'NO_CLOCK_IN', message: 'No clock-in record found for today.', requestId: req.requestId },
        });
    }
    if (attendance.clockOut) {
        return res.status(409).json({
            error: { code: 'ALREADY_CLOCKED_OUT', message: 'You have already clocked out today.', requestId: req.requestId },
        });
    }
    if (!attendance.clockIn) {
        return res.status(400).json({
            error: { code: 'NO_CLOCK_IN', message: 'Cannot clock out without clocking in first.', requestId: req.requestId },
        });
    }
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const crossesMidnight = (0, rules_engine_1.doesShiftCrossMidnight)(shift.startTime, shift.endTime);
    let scheduledEnd = luxon_1.DateTime.fromISO(workDate).setZone(timezone).set({ hour: endH, minute: endM, second: 0, millisecond: 0 });
    if (crossesMidnight) {
        scheduledEnd = scheduledEnd.plus({ days: 1 });
    }
    const clockInTime = luxon_1.DateTime.fromISO(attendance.clockIn.toISOString());
    const clockOutResult = (0, rules_engine_2.evaluateClockOut)({
        scheduledEnd,
        actualClockOut: now,
        clockIn: clockInTime,
        breakDurationMinutes: shift.breakDurationMinutes,
        overtimeRules: shift.overtimeRules,
    });
    const updated = await prisma_1.default.attendance.update({
        where: { id: attendance.id },
        data: {
            clockOut: now.toJSDate(),
            workedMinutes: clockOutResult.workedMinutes,
            overtimeMinutes: clockOutResult.overtimeMinutes,
            earlyDepartureMinutes: clockOutResult.earlyDepartureMinutes,
        },
        include: { shift: true, employee: { include: { department: true } } },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CLOCK_OUT', 'Attendance', updated.id);
    res.json(formatAttendance(updated));
}
async function getTodayStatus(req, res) {
    const userId = req.user.id;
    const employee = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!employee) {
        return res.status(404).json({
            error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId },
        });
    }
    const org = await prisma_1.default.organization.findUnique({ where: { id: req.user.organizationId } });
    const timezone = org?.timezone || 'Africa/Lagos';
    const workDate = luxon_1.DateTime.now().setZone(timezone).toISODate();
    const attendance = await prisma_1.default.attendance.findUnique({
        where: { employeeId_workDate: { employeeId: userId, workDate: new Date(workDate) } },
        include: { shift: true, employee: { include: { department: true } } },
    });
    res.json(attendance ? formatAttendance(attendance) : null);
}
async function getAttendanceHistory(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const { dateFrom, dateTo, departmentId, shiftId, status, employeeId } = req.query;
    const where = {
        organizationId: req.user.organizationId,
    };
    // For employees, only show their own attendance
    if (req.user.role === 'EMPLOYEE') {
        where.employeeId = req.user.id;
    }
    else if (employeeId) {
        where.employeeId = employeeId;
    }
    if (dateFrom || dateTo) {
        where.workDate = {};
        if (dateFrom)
            where.workDate.gte = new Date(dateFrom);
        if (dateTo)
            where.workDate.lte = new Date(dateTo);
    }
    if (shiftId)
        where.shiftId = shiftId;
    if (status)
        where.status = status;
    if (departmentId) {
        where.employee = { departmentId };
    }
    const [total, records] = await Promise.all([
        prisma_1.default.attendance.count({ where }),
        prisma_1.default.attendance.findMany({
            where,
            include: { shift: true, employee: { include: { department: true } } },
            orderBy: { workDate: 'desc' },
            skip,
            take: pageSize,
        }),
    ]);
    res.json((0, pagination_1.paginatedResponse)(records.map(formatAttendance), total, page, pageSize));
}
async function submitCorrection(req, res) {
    const { attendance_id, requested_clock_in, requested_clock_out, reason } = req.body;
    const attendance = await prisma_1.default.attendance.findFirst({
        where: { id: attendance_id, organizationId: req.user.organizationId },
    });
    if (!attendance) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Attendance record not found', requestId: req.requestId },
        });
    }
    const correction = await prisma_1.default.attendanceCorrection.create({
        data: {
            organizationId: req.user.organizationId,
            attendanceId: attendance_id,
            employeeId: req.user.id,
            requestedClockIn: new Date(requested_clock_in),
            requestedClockOut: new Date(requested_clock_out),
            reason,
            status: 'PENDING',
        },
    });
    // Update attendance status
    await prisma_1.default.attendance.update({
        where: { id: attendance_id },
        data: { status: 'PENDING_CORRECTION' },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'SUBMIT_CORRECTION', 'AttendanceCorrection', correction.id);
    res.status(201).json({
        id: correction.id,
        organization_id: correction.organizationId,
        attendance_id: correction.attendanceId,
        employee_id: correction.employeeId,
        requested_clock_in: correction.requestedClockIn.toISOString(),
        requested_clock_out: correction.requestedClockOut.toISOString(),
        reason: correction.reason,
        status: correction.status,
        created_at: correction.created_at.toISOString(),
    });
}
async function getCorrections(req, res) {
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
    const [total, corrections] = await Promise.all([
        prisma_1.default.attendanceCorrection.count({ where }),
        prisma_1.default.attendanceCorrection.findMany({
            where,
            include: { employee: true, reviewer: true, attendance: true },
            orderBy: { created_at: 'desc' },
            skip,
            take: pageSize,
        }),
    ]);
    const formatted = corrections.map((c) => ({
        id: c.id,
        organization_id: c.organizationId,
        attendance_id: c.attendanceId,
        employee_id: c.employeeId,
        employee_name: c.employee.name,
        work_date: c.attendance?.workDate.toISOString().split('T')[0],
        requested_clock_in: c.requestedClockIn.toISOString(),
        requested_clock_out: c.requestedClockOut.toISOString(),
        reason: c.reason,
        status: c.status,
        reviewed_by: c.reviewedById,
        reviewed_by_name: c.reviewer?.name,
        review_notes: null,
        reviewed_at: c.reviewedAt?.toISOString() || null,
        created_at: c.created_at.toISOString(),
    }));
    res.json((0, pagination_1.paginatedResponse)(formatted, total, page, pageSize));
}
async function reviewCorrection(req, res) {
    const { status, review_notes } = req.body;
    const correction = await prisma_1.default.attendanceCorrection.findFirst({
        where: { id: String(req.params.id), organizationId: req.user.organizationId },
        include: { attendance: true },
    });
    if (!correction) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Correction not found', requestId: req.requestId },
        });
    }
    const updated = await prisma_1.default.attendanceCorrection.update({
        where: { id: String(req.params.id) },
        data: {
            status,
            reviewedById: req.user.id,
            reviewedAt: new Date(),
        },
    });
    // If approved, update the attendance record
    if (status === 'APPROVED') {
        await prisma_1.default.attendance.update({
            where: { id: correction.attendanceId },
            data: {
                clockIn: correction.requestedClockIn,
                clockOut: correction.requestedClockOut,
                status: 'CLOCK',
                source: 'CORRECTION',
            },
        });
    }
    else if (status === 'REJECTED') {
        // Restore original status
        await prisma_1.default.attendance.update({
            where: { id: correction.attendanceId },
            data: { status: correction.attendance?.status || 'ABSENT' },
        });
    }
    await (0, audit_service_1.auditFromRequest)(req, 'REVIEW_CORRECTION', 'AttendanceCorrection', updated.id);
    res.json({
        id: updated.id,
        status: updated.status,
        reviewed_at: updated.reviewedAt?.toISOString(),
    });
}
async function getTeamLive(req, res) {
    const org = await prisma_1.default.organization.findUnique({ where: { id: req.user.organizationId } });
    const timezone = org?.timezone || 'Africa/Lagos';
    const workDate = luxon_1.DateTime.now().setZone(timezone).toISODate();
    const records = await prisma_1.default.attendance.findMany({
        where: {
            organizationId: req.user.organizationId,
            workDate: new Date(workDate),
        },
        include: { shift: true, employee: { include: { department: true } } },
        orderBy: { clockIn: 'desc' },
    });
    res.json(records.map(formatAttendance));
}
//# sourceMappingURL=attendance.service.js.map