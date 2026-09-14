"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrgTimezone = getOrgTimezone;
exports.nowInTimezone = nowInTimezone;
exports.dateToTimezone = dateToTimezone;
exports.timeStringToDateTime = timeStringToDateTime;
exports.getShiftStartDateTime = getShiftStartDateTime;
exports.getShiftEndDateTime = getShiftEndDateTime;
exports.doesShiftCrossMidnight = doesShiftCrossMidnight;
exports.isWorkingDay = isWorkingDay;
exports.getWorkDateForShift = getWorkDateForShift;
exports.toISO = toISO;
exports.toISODate = toISODate;
exports.differenceInMinutes = differenceInMinutes;
exports.addMinutes = addMinutes;
const luxon_1 = require("luxon");
function getOrgTimezone(orgTimezone = 'Africa/Lagos') {
    return orgTimezone;
}
function nowInTimezone(timezone) {
    return luxon_1.DateTime.now().setZone(timezone);
}
function dateToTimezone(date, timezone) {
    return luxon_1.DateTime.fromISO(typeof date === 'string' ? date : date.toISOString()).setZone(timezone);
}
function timeStringToDateTime(timeStr, date, timezone) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return luxon_1.DateTime.fromISO(date).setZone(timezone).set({ hour: minutes === undefined ? hours : hours, minute: minutes || 0, second: 0, millisecond: 0 });
}
function getShiftStartDateTime(shiftStartTime, workDate, timezone) {
    const [hours, minutes] = shiftStartTime.split(':').map(Number);
    return luxon_1.DateTime.fromISO(workDate).setZone(timezone).set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
}
function getShiftEndDateTime(shiftEndTime, workDate, timezone, crossesMidnight = false) {
    const [hours, minutes] = shiftEndTime.split(':').map(Number);
    let dt = luxon_1.DateTime.fromISO(workDate).setZone(timezone);
    if (crossesMidnight) {
        dt = dt.plus({ days: 1 });
    }
    return dt.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
}
function doesShiftCrossMidnight(startTime, endTime) {
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);
    return endH < startH;
}
function isWorkingDay(date, workingDays) {
    const dayOfWeek = date.weekday % 7; // Luxon: 1=Mon..7=Sun, we want 0=Sun..6=Sat
    const days = workingDays.split(',').map(Number);
    return days.includes(dayOfWeek);
}
function getWorkDateForShift(now, shiftStartTime, crossesMidnight) {
    if (crossesMidnight) {
        const [startH] = shiftStartTime.split(':').map(Number);
        if (now.hour < startH) {
            return now.minus({ days: 1 }).toISODate();
        }
    }
    return now.toISODate();
}
function toISO(date) {
    return date.toISO();
}
function toISODate(date) {
    return date.toISODate();
}
function differenceInMinutes(a, b) {
    return Math.round(a.diff(b, 'minutes').minutes);
}
function addMinutes(date, minutes) {
    return date.plus({ minutes });
}
//# sourceMappingURL=datetime.js.map