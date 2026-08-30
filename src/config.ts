// Both local and deployed builds use same-origin /api. Vite proxies this to
// localhost:3000 in development; production rewrites /api to the backend.
// A full URL may still be supplied explicitly for a non-proxied environment.
export const BASE_URL = import.meta.env.VITE_API_URL || "/api";
