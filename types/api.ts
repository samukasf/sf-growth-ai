export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  page: number;
  totalPages: number;
  totalItems: number;
};
