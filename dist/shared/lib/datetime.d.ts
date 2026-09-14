import { DateTime } from 'luxon';
export declare function getOrgTimezone(orgTimezone?: string): string;
export declare function nowInTimezone(timezone: string): DateTime;
export declare function dateToTimezone(date: Date | string, timezone: string): DateTime;
export declare function timeStringToDateTime(timeStr: string, date: string, timezone: string): DateTime;
export declare function getShiftStartDateTime(shiftStartTime: string, workDate: string, timezone: string): DateTime;
export declare function getShiftEndDateTime(shiftEndTime: string, workDate: string, timezone: string, crossesMidnight?: boolean): DateTime;
export declare function doesShiftCrossMidnight(startTime: string, endTime: string): boolean;
export declare function isWorkingDay(date: DateTime, workingDays: string): boolean;
export declare function getWorkDateForShift(now: DateTime, shiftStartTime: string, crossesMidnight: boolean): string;
export declare function toISO(date: DateTime): string;
export declare function toISODate(date: DateTime): string;
export declare function differenceInMinutes(a: DateTime, b: DateTime): number;
export declare function addMinutes(date: DateTime, minutes: number): DateTime;
//# sourceMappingURL=datetime.d.ts.map