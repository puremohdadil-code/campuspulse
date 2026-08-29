// Endpoint paths for the SkyFinance API (see server.js for router mounts).
// Kept as plain path constants — src/api/http.ts prefixes them with BASE_URL.

export const AUTH = {
  login: "/auth/login",
  signup: "/auth/signup",
  logout: "/auth/logout",
  refreshToken: "/auth/refresh-token",
  verifyEmail: "/auth/verify-email",
  resendVerification: "/auth/resend-verification",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

// Mounted at /api in server.js (NOT /auth) — see routes/verifyRoute.js.
export const verifyToken = "/api/verify-token";

export const USER = {
  info: "/user/get/info",
  settings: "/user/settings",
};
