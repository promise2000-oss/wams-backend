"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.generateAccessToken = generateAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../redis"));
const logger_1 = __importDefault(require("../lib/logger"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header', requestId: req.requestId },
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'Missing token', requestId: req.requestId },
            });
        }
        // Check if token is revoked (logout / force-revocation)
        const isRevoked = await redis_1.default.get(`token:revoked:${token}`);
        if (isRevoked) {
            return res.status(401).json({
                error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked', requestId: req.requestId },
            });
        }
        const payload = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        req.user = {
            id: payload.sub,
            organizationId: payload.organizationId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            departmentId: payload.departmentId,
            managerId: payload.managerId,
        };
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: { code: 'TOKEN_EXPIRED', message: 'Access token expired', requestId: req.requestId },
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: { code: 'INVALID_TOKEN', message: 'Invalid token', requestId: req.requestId },
            });
        }
        logger_1.default.error('[Auth] Unexpected error in auth middleware', { error: err.message });
        return res.status(500).json({
            error: { code: 'INTERNAL_ERROR', message: 'Authentication error', requestId: req.requestId },
        });
    }
}
function generateAccessToken(user) {
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '15m');
    return jsonwebtoken_1.default.sign({
        sub: user.id,
        organizationId: user.organizationId,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        managerId: user.managerId,
    }, ACCESS_SECRET, { expiresIn });
}
//# sourceMappingURL=auth.js.map