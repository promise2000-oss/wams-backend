"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.paginatedResponse = paginatedResponse;
exports.parseFilters = parseFilters;
function parsePagination(req) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 25));
    const skip = (page - 1) * pageSize;
    return { page, pageSize, skip };
}
function paginatedResponse(data, total, page, pageSize) {
    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
function parseFilters(req) {
    return {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        departmentId: req.query.departmentId,
        shiftId: req.query.shiftId,
        status: req.query.status,
        search: req.query.search,
    };
}
//# sourceMappingURL=pagination.js.map