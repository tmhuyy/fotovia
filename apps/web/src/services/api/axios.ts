import axios, { type AxiosInstance } from "axios";
import { authToken } from "../../lib/auth-token";

const createClient = (baseURL?: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = authToken.get();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

export const apiClient = createClient(process.env.NEXT_PUBLIC_API_BASE_URL);
export const authClient = createClient(process.env.NEXT_PUBLIC_AUTH_API_URL);
