"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../shared/middleware/auth");
const rbac_1 = require("../../shared/middleware/rbac");
const audit_service_1 = require("./audit.service");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, rbac_1.authorize)('audit.view'), audit_service_1.listAuditLogs);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map