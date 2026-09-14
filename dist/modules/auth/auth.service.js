"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.refresh = refresh;
exports.logout = logout;
exports.logoutAll = logoutAll;
exports.me = me;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.changePassword = changePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const redis_1 = __importDefault(require("../../shared/redis"));
const auth_1 = require("../../shared/middleware/auth");
const audit_service_1 = require("../audit/audit.service");
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in ms
const BCRYPT_COST = 12;
function setRefreshCookie(res, token, maxAge) {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
        path: '/',
    });
}
async function login(req, res) {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findFirst({
        where: { email, status: 'ACTIVE' },
        include: { organization: true },
    });
    if (!user) {
        return res.status(401).json({
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId: req.requestId },
        });
    }
    const validPassword = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!validPassword) {
        return res.status(401).json({
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId: req.requestId },
        });
    }
    const accessToken = (0, auth_1.generateAccessToken)({
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        managerId: user.managerId,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });
    await prisma_1.default.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN),
        },
    });
    setRefreshCookie(res, refreshToken, REFRESH_EXPIRES_IN);
    await (0, audit_service_1.auditFromRequest)(req, 'LOGIN', 'User', user.id);
    res.json({
        accessToken,
        user: {
            id: user.id,
            organization_id: user.organizationId,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            employee_id: user.employeeId,
            department_id: user.departmentId,
            manager_id: user.managerId,
            shift_id: user.shiftId,
            position: user.position,
            employment_status: user.status,
            date_joined: user.dateJoined.toISOString(),
            avatar_url: user.avatarUrl,
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString(),
        },
        organization: {
            id: user.organization.id,
            name: user.organization.name,
            timezone: user.organization.timezone,
            created_at: user.organization.created_at.toISOString(),
            updated_at: user.organization.updated_at.toISOString(),
        },
    });
}
async function register(req, res) {
    const { name, email, password, organizationName, timezone } = req.body;
    const existingOrg = await prisma_1.default.user.findFirst({ where: { email } });
    if (existingOrg) {
        return res.status(409).json({
            error: { code: 'EMAIL_EXISTS', message: 'A user with this email already exists', requestId: req.requestId },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(password, BCRYPT_COST);
    const organization = await prisma_1.default.organization.create({
        data: {
            name: organizationName,
            timezone: timezone || 'Africa/Lagos',
        },
    });
    const user = await prisma_1.default.user.create({
        data: {
            organizationId: organization.id,
            name,
            email,
            passwordHash,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
        },
    });
    const accessToken = (0, auth_1.generateAccessToken)({
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        managerId: user.managerId,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });
    await prisma_1.default.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN),
        },
    });
    setRefreshCookie(res, refreshToken, REFRESH_EXPIRES_IN);
    res.status(201).json({
        accessToken,
        user: {
            id: user.id,
            organization_id: user.organizationId,
            email: user.email,
            name: user.name,
            role: user.role,
            employment_status: user.status,
        },
        organization: {
            id: organization.id,
            name: organization.name,
            timezone: organization.timezone,
        },
    });
}
async function refresh(req, res) {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({
            error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided', requestId: req.requestId },
        });
    }
    const storedToken = await prisma_1.default.refreshToken.findUnique({ where: { token } });
    if (!storedToken) {
        return res.status(401).json({
            error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token', requestId: req.requestId },
        });
    }
    if (storedToken.revokedAt) {
        // Token reuse detected — revoke all sessions
        await prisma_1.default.refreshToken.updateMany({
            where: { userId: storedToken.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return res.status(401).json({
            error: { code: 'TOKEN_REUSE', message: 'Refresh token reuse detected. All sessions revoked.', requestId: req.requestId },
        });
    }
    if (storedToken.expiresAt < new Date()) {
        return res.status(401).json({
            error: { code: 'TOKEN_EXPIRED', message: 'Refresh token expired', requestId: req.requestId },
        });
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: storedToken.userId } });
    if (!user || user.status !== 'ACTIVE') {
        return res.status(401).json({
            error: { code: 'USER_INACTIVE', message: 'User account is inactive', requestId: req.requestId },
        });
    }
    // Rotate: revoke old token, issue new one
    const newRefreshToken = jsonwebtoken_1.default.sign({ sub: user.id, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });
    await prisma_1.default.$transaction([
        prisma_1.default.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date(), replacedBy: newRefreshToken },
        }),
        prisma_1.default.refreshToken.create({
            data: {
                userId: user.id,
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN),
            },
        }),
    ]);
    const accessToken = (0, auth_1.generateAccessToken)({
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        managerId: user.managerId,
    });
    setRefreshCookie(res, newRefreshToken, REFRESH_EXPIRES_IN);
    res.json({ accessToken });
}
async function logout(req, res) {
    const token = req.cookies?.refreshToken;
    if (token) {
        await prisma_1.default.refreshToken.updateMany({
            where: { token },
            data: { revokedAt: new Date() },
        });
    }
    // Also blacklist the current access token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const accessToken = authHeader.split(' ')[1];
        await redis_1.default.setex(`token:revoked:${accessToken}`, 15 * 60, '1');
    }
    res.clearCookie('refreshToken');
    res.status(204).send();
}
async function logoutAll(req, res) {
    if (req.user) {
        await prisma_1.default.refreshToken.updateMany({
            where: { userId: req.user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        // Blacklist the current access token
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const accessToken = authHeader.split(' ')[1];
            await redis_1.default.setex(`token:revoked:${accessToken}`, 15 * 60, '1');
        }
    }
    res.clearCookie('refreshToken');
    res.status(204).send();
}
async function me(req, res) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true },
    });
    if (!user) {
        return res.status(404).json({
            error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId },
        });
    }
    res.json({
        user: {
            id: user.id,
            organization_id: user.organizationId,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            employee_id: user.employeeId,
            department_id: user.departmentId,
            manager_id: user.managerId,
            shift_id: user.shiftId,
            position: user.position,
            employment_status: user.status,
            date_joined: user.dateJoined.toISOString(),
            avatar_url: user.avatarUrl,
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString(),
        },
        organization: {
            id: user.organization.id,
            name: user.organization.name,
            timezone: user.organization.timezone,
            created_at: user.organization.created_at.toISOString(),
            updated_at: user.organization.updated_at.toISOString(),
        },
    });
}
async function forgotPassword(req, res) {
    const { email } = req.body;
    // Always return success to prevent email enumeration
    const user = await prisma_1.default.user.findFirst({ where: { email, status: 'ACTIVE' } });
    if (user) {
        const resetToken = jsonwebtoken_1.default.sign({ sub: user.id, type: 'reset' }, process.env.JWT_ACCESS_SECRET || 'dev-access-secret', { expiresIn: '1h' });
        await redis_1.default.setex(`password-reset:${resetToken}`, 3600, user.id);
        // TODO: Send email with reset link
        console.log(`[PasswordReset] Token for ${email}: ${resetToken}`);
    }
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
}
async function resetPassword(req, res) {
    const { token, password } = req.body;
    const userId = await redis_1.default.get(`password-reset:${token}`);
    if (!userId) {
        return res.status(400).json({
            error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token', requestId: req.requestId },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(password, BCRYPT_COST);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { passwordHash },
    });
    await redis_1.default.del(`password-reset:${token}`);
    // Revoke all sessions
    await prisma_1.default.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
    res.json({ message: 'Password reset successful. Please login with your new password.' });
}
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
        return res.status(404).json({
            error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId },
        });
    }
    const validPassword = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
        return res.status(401).json({
            error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect', requestId: req.requestId },
        });
    }
    const passwordHash = await bcrypt_1.default.hash(newPassword, BCRYPT_COST);
    await prisma_1.default.user.update({
        where: { id: req.user.id },
        data: { passwordHash },
    });
    await (0, audit_service_1.auditFromRequest)(req, 'CHANGE_PASSWORD', 'User', req.user.id);
    res.json({ message: 'Password changed successfully' });
}
//# sourceMappingURL=auth.service.js.map