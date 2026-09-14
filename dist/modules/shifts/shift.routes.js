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
const shiftService = __importStar(require("./shift.service"));
const router = (0, express_1.Router)();
const createShiftSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    start_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    end_time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    grace_period_minutes: zod_1.z.number().min(0).max(120).optional(),
    break_duration_minutes: zod_1.z.number().min(0).max(120).optional(),
    working_days: zod_1.z.array(zod_1.z.number().min(0).max(6)).optional(),
    overtime_rules: zod_1.z.object({
        max_overtime_minutes: zod_1.z.number().min(0),
        rate_multiplier: zod_1.z.number().min(1).max(5),
    }).optional(),
});
const updateShiftSchema = createShiftSchema.partial();
const createAssignmentSchema = zod_1.z.object({
    shift_id: zod_1.z.string().uuid(),
    employee_id: zod_1.z.string().uuid(),
    effective_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    effective_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
router.get('/', auth_1.authenticate, (0, rbac_1.authorize)('attendance.view'), shiftService.listShifts);
router.get('/:id', auth_1.authenticate, (0, rbac_1.authorize)('attendance.view'), shiftService.getShift);
router.post('/', auth_1.authenticate, (0, rbac_1.authorize)('shift.create'), (0, validation_1.validate)(createShiftSchema), shiftService.createShift);
router.put('/:id', auth_1.authenticate, (0, rbac_1.authorize)('shift.update'), (0, validation_1.validate)(updateShiftSchema), shiftService.updateShift);
router.post('/:id/archive', auth_1.authenticate, (0, rbac_1.authorize)('shift.archive'), shiftService.archiveShift);
router.get('/assignments/list', auth_1.authenticate, (0, rbac_1.authorize)('attendance.view'), shiftService.listShiftAssignments);
router.post('/assignments', auth_1.authenticate, (0, rbac_1.authorize)('shift.assign'), (0, validation_1.validate)(createAssignmentSchema), shiftService.createShiftAssignment);
exports.default = router;
//# sourceMappingURL=shift.routes.js.map