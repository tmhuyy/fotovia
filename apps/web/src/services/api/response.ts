import type { ApiResponse } from "./types";

const isApiResponse = <T>(payload: ApiResponse<T> | T): payload is ApiResponse<T> => {
  return typeof payload === "object" && payload !== null && "data" in payload;
};

export const unwrapResponse = <T>(payload: ApiResponse<T> | T): T => {
  return isApiResponse(payload) ? payload.data : payload;
};
