import axios from "axios";

export interface ApiError {
  message: string;
  status?: number;
}

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export const normalizeApiError = (
  error: unknown,
  fallbackMessage: string = DEFAULT_MESSAGE
): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string | string[] } | undefined;
    let message = fallbackMessage;

    if (data?.message) {
      message = Array.isArray(data.message) ? data.message[0] ?? fallbackMessage : data.message;
    }

    return { message, status };
  }

  return { message: fallbackMessage };
};
