export interface ConvexResponse<T> {
  data: T | null;
  ok: boolean;
  message: string;
}
