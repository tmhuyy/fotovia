const AUTH_TOKEN_KEY = "fotovia_access_token";

const isBrowser = () => typeof window !== "undefined";

export const authToken = {
  get: () => {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  },
  set: (token: string) => {
    if (!isBrowser()) return;
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear: () => {
    if (!isBrowser()) return;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};
