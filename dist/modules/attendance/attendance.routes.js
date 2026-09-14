"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validation_1 = require("../../shared/middleware/validation");
const auth_1 = require("../../shared/middleware/auth");
const rbac_1 = require("../../shared/middleware/rbac");
const idempotency_1 = require("../../shared/lib/idempotency");
const attendanceService = __importStar(require("./attendance.service"));
const router = (0, express_1.Router)();
const clockInSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
const clockOutSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
const submitCorrectionSchema = zod_1.z.object({
    attendance_id: zod_1.z.string().uuid(),
    requested_clock_in: zod_1.z.string().datetime(),
    requested_clock_out: zod_1.z.string().datetime(),
    reason: zod_1.z.string().min(1).max(500),
});
const reviewCorrectionSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    review_notes: zod_1.z.string().optional(),
});
router.post('/clock-in', auth_1.authenticate, (0, rbac_1.authorize)('attendance.clockIn'), idempotency_1.idempotencyMiddleware, (0, validation_1.validate)(clockInSchema), attendanceService.clockIn);
router.post('/clock-out', auth_1.authenticate, (0, rbac_1.authorize)('attendance.clockOut'), idempotency_1.idempotencyMiddleware, (0, validation_1.validate)(clockOutSchema), attendanceService.clockOut);
router.get('/today', auth_1.authenticate, attendanceService.getTodayStatus);
router.get('/history', auth_1.authenticate, (0, rbac_1.authorize)('attendance.history'), attendanceService.getAttendanceHistory);
router.get('/team-live', auth_1.authenticate, (0, rbac_1.authorize)('attendance.teamLive'), attendanceService.getTeamLive);
router.post('/corrections', auth_1.authenticate, (0, rbac_1.authorize)('attendance.correction.submit'), (0, validation_1.validate)(submitCorrectionSchema), attendanceService.submitCorrection);
router.get('/corrections', auth_1.authenticate, (0, rbac_1.authorize)('attendance.view'), attendanceService.getCorrections);
router.post('/corrections/:id/review', auth_1.authenticate, (0, rbac_1.authorize)('attendance.correction.review'), (0, validation_1.validate)(reviewCorrectionSchema), attendanceService.reviewCorrection);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map