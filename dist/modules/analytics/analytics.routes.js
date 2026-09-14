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
const analyticsService = __importStar(require("./analytics.service"));
const router = (0, express_1.Router)();
const createSnapshotSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
router.get('/dashboard', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getDashboardMetrics);
router.get('/attendance', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getAttendanceTrend);
router.get('/late-arrivals', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getLateArrivalTrend);
router.get('/work-hours', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getWorkHours);
router.get('/departments', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getDepartmentComparison);
router.get('/anomalies', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getAnomalies);
router.get('/benchmark', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.getBenchmark);
router.get('/snapshots', auth_1.authenticate, (0, rbac_1.authorize)('analytics.view'), analyticsService.listSnapshots);
router.post('/snapshots', auth_1.authenticate, (0, rbac_1.authorize)('analytics.snapshot.create'), (0, validation_1.validate)(createSnapshotSchema), analyticsService.createSnapshot);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map