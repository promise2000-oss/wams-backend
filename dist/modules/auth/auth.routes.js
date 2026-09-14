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
const rate_limiter_1 = require("../../shared/middleware/rate-limiter");
const authService = __importStar(require("./auth.service"));
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    organizationName: zod_1.z.string().min(1).max(200),
    timezone: zod_1.z.string().optional(),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8).max(128),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8).max(128),
});
router.post('/login', rate_limiter_1.authRateLimiter, (0, validation_1.validate)(loginSchema), authService.login);
router.post('/register', (0, validation_1.validate)(registerSchema), authService.register);
router.post('/refresh', authService.refresh);
router.post('/logout', authService.logout);
router.post('/logout-all', auth_1.authenticate, authService.logoutAll);
router.get('/me', auth_1.authenticate, authService.me);
router.post('/forgot-password', rate_limiter_1.authRateLimiter, (0, validation_1.validate)(forgotPasswordSchema), authService.forgotPassword);
router.post('/reset-password', (0, validation_1.validate)(resetPasswordSchema), authService.resetPassword);
router.post('/change-password', auth_1.authenticate, (0, validation_1.validate)(changePasswordSchema), authService.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map