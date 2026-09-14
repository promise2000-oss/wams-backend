import { DateTime } from 'luxon';
export type AttendanceStatusType = 'PRESENT' | 'LATE' | 'ABSENT' | 'EARLY_DEPARTURE' | 'ON_LEAVE' | 'HALF_DAY' | 'HOLIDAY' | 'WEEKEND' | 'PENDING_CORRECTION';
export interface OvertimeRules {
    max_overtime_minutes: number;
    rate_multiplier: number;
}
export interface ClockInInput {
    scheduledStart: DateTime;
    gracePeriodMinutes: number;
    actualClockIn: DateTime;
}
export interface ClockInResult {
    status: 'PRESENT' | 'LATE';
    lateMinutes: number;
}
export interface ClockOutInput {
    scheduledEnd: DateTime;
    actualClockOut: DateTime;
    clockIn: DateTime;
    breakDurationMinutes: number;
    overtimeRules?: OvertimeRules | null;
}
export interface ClockOutResult {
    workedMinutes: number;
    overtimeMinutes: number;
    earlyDepartureMinutes: number;
}
export interface DailyStatusInput {
    hasApprovedLeave: boolean;
    isHoliday: boolean;
    isWorkingDay: boolean;
    clockInResult?: ClockInResult;
    clockOutResult?: ClockOutResult;
}
/**
 * Evaluate clock-in status based on scheduled start and grace period.
 * PRD §10: shift 08:00, grace 15 min, clock-in 08:07 → PRESENT.
 * PRD §10: shift 08:00, grace 15 min, clock-in 08:27 → LATE, 12 minutes.
 */
export declare function evaluateClockIn(input: ClockInInput): ClockInResult;
/**
 * Evaluate clock-out metrics: worked minutes, overtime, early departure.
 * PRD §44: clock-in 08:22, clock-out 16:35 → worked: 473 min, overtime: 35 min
 * (scheduled end 17:00, so 16:35 is 25 min early departure, not overtime)
 */
export declare function evaluateClockOut(input: ClockOutInput): ClockOutResult;
/**
 * Resolve the final daily attendance status from all inputs.
 * Priority: leave > holiday > weekend > clock-in/clock-out result.
 */
export declare function resolveDailyStatus(input: DailyStatusInput): AttendanceStatusType;
/**
 * Determine the work date for a given shift.
 * For overnight shifts (e.g., 22:00-07:00), the work date is the previous day if before shift start.
 */
export declare function getWorkDateForShift(now: DateTime, shiftStartTime: string, crossesMidnight: boolean): string;
/**
 * Check if a shift crosses midnight (end time < start time).
 */
export declare function doesShiftCrossMidnight(startTime: string, endTime: string): boolean;
//# sourceMappingURL=rules-engine.d.ts.map