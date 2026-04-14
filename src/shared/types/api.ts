export interface ApiSuccess<T> {
  success: true;
  msg: string;
  data: T;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems?: number;
  total?: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
