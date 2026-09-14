import { Request } from 'express';
export interface PaginationParams {
    page: number;
    pageSize: number;
    skip: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare function parsePagination(req: Request): PaginationParams;
export declare function paginatedResponse<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResponse<T>;
export interface FilterParams {
    dateFrom?: string;
    dateTo?: string;
    departmentId?: string;
    shiftId?: string;
    status?: string;
    search?: string;
}
export declare function parseFilters(req: Request): FilterParams;
//# sourceMappingURL=pagination.d.ts.map