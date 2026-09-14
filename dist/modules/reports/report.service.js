"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
exports.listReports = listReports;
exports.downloadReport = downloadReport;
const queues_1 = require("../../shared/queue/queues");
const pagination_1 = require("../../shared/lib/pagination");
const audit_service_1 = require("../audit/audit.service");
async function generateReport(req, res) {
    const { type, filters } = req.body;
    const job = await queues_1.reportsQueue.add('generate-report', {
        organizationId: req.user.organizationId,
        userId: req.user.id,
        type,
        filters,
    });
    await (0, audit_service_1.auditFromRequest)(req, 'GENERATE', 'Report', job.id);
    res.status(202).json({
        id: `RPT-${job.id}`,
        type,
        status: 'PENDING',
        filters,
        generated_by: req.user.id,
        created_at: new Date().toISOString(),
    });
}
async function listReports(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    // For MVP, return empty list - reports tracked in a table later
    res.json((0, pagination_1.paginatedResponse)([], 0, page, pageSize));
}
async function downloadReport(req, res) {
    // For MVP, return placeholder
    res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Report not found or still generating', requestId: req.requestId },
    });
}
//# sourceMappingURL=report.service.js.map