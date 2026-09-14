"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateClockIn = evaluateClockIn;
exports.evaluateClockOut = evaluateClockOut;
exports.resolveDailyStatus = resolveDailyStatus;
exports.getWorkDateForShift = getWorkDateForShift;
exports.doesShiftCrossMidnight = doesShiftCrossMidnight;
// ── Pure Functions (100% unit-testable, no I/O) ──
/**
 * Evaluate clock-in status based on scheduled start and grace period.
 * PRD §10: shift 08:00, grace 15 min, clock-in 08:07 → PRESENT.
 * PRD §10: shift 08:00, grace 15 min, clock-in 08:27 → LATE, 12 minutes.
 */
function evaluateClockIn(input) {
    const { scheduledStart, gracePeriodMinutes, actualClockIn } = input;
    const scheduledMinutes = scheduledStart.hour * 60 + scheduledStart.minute;
    const actualMinutes = actualClockIn.hour * 60 + actualClockIn.minute;
    const graceEnd = scheduledMinutes + gracePeriodMinutes;
    if (actualMinutes <= graceEnd) {
        return { status: 'PRESENT', lateMinutes: 0 };
    }
    const lateMinutes = actualMinutes - scheduledMinutes;
    return { status: 'LATE', lateMinutes };
}
/**
 * Evaluate clock-out metrics: worked minutes, overtime, early departure.
 * PRD §44: clock-in 08:22, clock-out 16:35 → worked: 473 min, overtime: 35 min
 * (scheduled end 17:00, so 16:35 is 25 min early departure, not overtime)
 */
function evaluateClockOut(input) {
    const { scheduledEnd, actualClockOut, clockIn, breakDurationMinutes, overtimeRules } = input;
    const totalMinutes = Math.max(0, Math.round(actualClockOut.diff(clockIn, 'minutes').minutes));
    const workedMinutes = Math.max(0, totalMinutes - breakDurationMinutes);
    const scheduledEndMinutes = scheduledEnd.hour * 60 + scheduledEnd.minute;
    const actualEndMinutes = actualClockOut.hour * 60 + actualClockOut.minute;
    let overtimeMinutes = 0;
    let earlyDepartureMinutes = 0;
    if (actualEndMinutes > scheduledEndMinutes) {
        overtimeMinutes = actualEndMinutes - scheduledEndMinutes;
        if (overtimeRules?.max_overtime_minutes) {
            overtimeMinutes = Math.min(overtimeMinutes, overtimeRules.max_overtime_minutes);
        }
    }
    else if (actualEndMinutes < scheduledEndMinutes) {
        earlyDepartureMinutes = scheduledEndMinutes - actualEndMinutes;
    }
    return { workedMinutes, overtimeMinutes, earlyDepartureMinutes };
}
/**
 * Resolve the final daily attendance status from all inputs.
 * Priority: leave > holiday > weekend > clock-in/clock-out result.
 */
function resolveDailyStatus(input) {
    const { hasApprovedLeave, isHoliday, isWorkingDay, clockInResult, clockOutResult } = input;
    if (hasApprovedLeave)
        return 'ON_LEAVE';
    if (isHoliday)
        return 'HOLIDAY';
    if (!isWorkingDay)
        return 'WEEKEND';
    if (!clockInResult)
        return 'ABSENT';
    if (clockInResult.status === 'LATE' && clockOutResult && clockOutResult.earlyDepartureMinutes > 0) {
        return 'LATE'; // Late arrival takes precedence, early departure noted in fields
    }
    if (clockInResult.status === 'LATE')
        return 'LATE';
    if (clockOutResult && clockOutResult.earlyDepartureMinutes > 60) {
        return 'EARLY_DEPARTURE';
    }
    return 'PRESENT';
}
/**
 * Determine the work date for a given shift.
 * For overnight shifts (e.g., 22:00-07:00), the work date is the previous day if before shift start.
 */
function getWorkDateForShift(now, shiftStartTime, crossesMidnight) {
    if (crossesMidnight) {
        const [startH] = shiftStartTime.split(':').map(Number);
        if (now.hour < startH) {
            return now.minus({ days: 1 }).toISODate();
        }
    }
    return now.toISODate();
}
/**
 * Check if a shift crosses midnight (end time < start time).
 */
function doesShiftCrossMidnight(startTime, endTime) {
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);
    return endH < startH;
}
//# sourceMappingURL=rules-engine.js.map