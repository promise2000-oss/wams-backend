import { DateTime } from 'luxon';

export function getOrgTimezone(orgTimezone: string = 'Africa/Lagos'): string {
  return orgTimezone;
}

export function nowInTimezone(timezone: string): DateTime {
  return DateTime.now().setZone(timezone);
}

export function dateToTimezone(date: Date | string, timezone: string): DateTime {
  return DateTime.fromISO(typeof date === 'string' ? date : date.toISOString()).setZone(timezone);
}

export function timeStringToDateTime(timeStr: string, date: string, timezone: string): DateTime {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return DateTime.fromISO(date).setZone(timezone).set({ hour: minutes === undefined ? hours : hours, minute: minutes || 0, second: 0, millisecond: 0 });
}

export function getShiftStartDateTime(shiftStartTime: string, workDate: string, timezone: string): DateTime {
  const [hours, minutes] = shiftStartTime.split(':').map(Number);
  return DateTime.fromISO(workDate).setZone(timezone).set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
}

export function getShiftEndDateTime(shiftEndTime: string, workDate: string, timezone: string, crossesMidnight: boolean = false): DateTime {
  const [hours, minutes] = shiftEndTime.split(':').map(Number);
  let dt = DateTime.fromISO(workDate).setZone(timezone);
  if (crossesMidnight) {
    dt = dt.plus({ days: 1 });
  }
  return dt.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
}

export function doesShiftCrossMidnight(startTime: string, endTime: string): boolean {
  const [startH] = startTime.split(':').map(Number);
  const [endH] = endTime.split(':').map(Number);
  return endH < startH;
}

export function isWorkingDay(date: DateTime, workingDays: string): boolean {
  const dayOfWeek = date.weekday % 7; // Luxon: 1=Mon..7=Sun, we want 0=Sun..6=Sat
  const days = workingDays.split(',').map(Number);
  return days.includes(dayOfWeek);
}

export function getWorkDateForShift(now: DateTime, shiftStartTime: string, crossesMidnight: boolean): string {
  if (crossesMidnight) {
    const [startH] = shiftStartTime.split(':').map(Number);
    if (now.hour < startH) {
      return now.minus({ days: 1 }).toISODate()!;
    }
  }
  return now.toISODate()!;
}

export function toISO(date: DateTime): string {
  return date.toISO()!;
}

export function toISODate(date: DateTime): string {
  return date.toISODate()!;
}

export function differenceInMinutes(a: DateTime, b: DateTime): number {
  return Math.round(a.diff(b, 'minutes').minutes);
}

export function addMinutes(date: DateTime, minutes: number): DateTime {
  return date.plus({ minutes });
}
