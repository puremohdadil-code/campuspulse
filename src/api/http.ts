import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "../config";
import { AUTH } from "./endpoint";

// Single axios instance for the whole app. Cookies carry the JWTs
// (httpOnly `accessToken`/`refreshToken`, see server.js), so every
// request goes out with credentials — there is no token to attach by hand.
export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20_000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Concurrent 401s (e.g. a dashboard firing several queries at once) must
// share a single refresh call instead of each racing their own — this
// promise is the de-dupe point. Cleared once the refresh settles.
let refreshPromise: Promise<void> | null = null;

// A 401 from these endpoints means "wrong credentials / bad token in the
// request body", not "the access token expired" — refreshing would only
// fire a second doomed 401 and bounce the user to /auth.
const PUBLIC_AUTH_PATHS: string[] = [
  AUTH.login,
  AUTH.signup,
  AUTH.refreshToken,
  AUTH.verifyEmail,
  AUTH.resendVerification,
  AUTH.forgotPassword,
  AUTH.resetPassword,
];

function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = http
      .post(AUTH.refreshToken)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isPublicAuthCall = !!config?.url && PUBLIC_AUTH_PATHS.includes(config.url);

    if (status !== 401 || !config || config._retried || isPublicAuthCall) {
      throw error;
    }

    config._retried = true;

    try {
      await refreshAccessToken();
      return http(config);
    } catch (refreshError) {
      if (typeof window !== "undefined" && !PUBLIC_AUTH_PATHS.some((path) => window.location.pathname.includes(path))) {
        window.location.href = "/login";
      }
      throw refreshError;
    }
  }
);

export default http;
