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

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 25));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export interface FilterParams {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  shiftId?: string;
  status?: string;
  search?: string;
}

export function parseFilters(req: Request): FilterParams {
  return {
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
    departmentId: req.query.departmentId as string | undefined,
    shiftId: req.query.shiftId as string | undefined,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  };
}
