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
const leaveService = __importStar(require("./leave.service"));
const router = (0, express_1.Router)();
const createLeaveTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    days_per_year: zod_1.z.number().min(0).max(365).optional(),
    accrual_policy: zod_1.z.any().optional(),
    carry_over_max_days: zod_1.z.number().min(0).max(365).optional(),
});
const updateLeaveTypeSchema = createLeaveTypeSchema.partial().extend({ is_active: zod_1.z.boolean().optional() });
const createLeaveRequestSchema = zod_1.z.object({
    leave_type_id: zod_1.z.string().uuid(),
    start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    is_half_day: zod_1.z.boolean().optional(),
    half_day_period: zod_1.z.enum(['AM', 'PM']).optional(),
    reason: zod_1.z.string().min(1).max(500),
    document_url: zod_1.z.string().optional(),
});
const approveSchema = zod_1.z.object({ notes: zod_1.z.string().optional() });
const rejectSchema = zod_1.z.object({ reason: zod_1.z.string().min(1) });
const bulkApproveSchema = zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string().uuid()).min(1) });
const delegateSchema = zod_1.z.object({
    delegate_id: zod_1.z.string().uuid(),
    start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
router.get('/types', auth_1.authenticate, leaveService.listLeaveTypes);
router.post('/types', auth_1.authenticate, (0, rbac_1.authorize)('leave.manageTypes'), (0, validation_1.validate)(createLeaveTypeSchema), leaveService.createLeaveType);
router.put('/types/:id', auth_1.authenticate, (0, rbac_1.authorize)('leave.manageTypes'), (0, validation_1.validate)(updateLeaveTypeSchema), leaveService.updateLeaveType);
router.get('/balance', auth_1.authenticate, leaveService.getLeaveBalance);
router.get('/requests', auth_1.authenticate, leaveService.listLeaveRequests);
router.post('/requests', auth_1.authenticate, (0, rbac_1.authorize)('leave.create'), (0, validation_1.validate)(createLeaveRequestSchema), leaveService.createLeaveRequest);
router.post('/requests/:id/approve', auth_1.authenticate, (0, rbac_1.authorize)('leave.approve'), (0, validation_1.validate)(approveSchema), leaveService.approveLeaveRequest);
router.post('/requests/:id/reject', auth_1.authenticate, (0, rbac_1.authorize)('leave.reject'), (0, validation_1.validate)(rejectSchema), leaveService.rejectLeaveRequest);
router.post('/requests/bulk-approve', auth_1.authenticate, (0, rbac_1.authorize)('leave.bulkApprove'), (0, validation_1.validate)(bulkApproveSchema), leaveService.bulkApproveLeave);
router.get('/approvers/delegate', auth_1.authenticate, leaveService.listDelegates);
router.post('/approvers/delegate', auth_1.authenticate, (0, rbac_1.authorize)('leave.delegate'), (0, validation_1.validate)(delegateSchema), leaveService.createDelegate);
router.delete('/approvers/delegate/:id', auth_1.authenticate, (0, rbac_1.authorize)('leave.delegate'), leaveService.removeDelegate);
exports.default = router;
//# sourceMappingURL=leave.routes.js.map