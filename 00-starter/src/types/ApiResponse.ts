export interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}
