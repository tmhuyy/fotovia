import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { authToken } from "../../lib/auth-token";

const createClient = (
    baseURL?: string,
    options?: AxiosRequestConfig,
): AxiosInstance => {
    const client = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
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

export const authClient = createClient(process.env.NEXT_PUBLIC_AUTH_API_URL, {
    withCredentials: true,
});

export const profileClient = createClient(
    process.env.NEXT_PUBLIC_PROFILE_API_URL,
    {
        withCredentials: true,
    },
);

export const assetClient = createClient(process.env.NEXT_PUBLIC_ASSET_API_URL, {
    withCredentials: true,
});
