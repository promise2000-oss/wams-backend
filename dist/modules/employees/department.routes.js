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
const departmentService = __importStar(require("./department.service"));
const router = (0, express_1.Router)();
const createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    managerId: zod_1.z.string().uuid().optional(),
});
const updateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional().nullable(),
    managerId: zod_1.z.string().uuid().optional().nullable(),
});
router.get('/', auth_1.authenticate, (0, rbac_1.authorize)('employee.list'), departmentService.listDepartments);
router.post('/', auth_1.authenticate, (0, rbac_1.authorize)('department.create'), (0, validation_1.validate)(createDepartmentSchema), departmentService.createDepartment);
router.put('/:id', auth_1.authenticate, (0, rbac_1.authorize)('department.update'), (0, validation_1.validate)(updateDepartmentSchema), departmentService.updateDepartment);
exports.default = router;
//# sourceMappingURL=department.routes.js.map