// Split rather than a single VITE_API_URL: local dev talks to a local
// backend, but every other mode (staging/prod builds) needs the deployed
// API — using Vite's built-in MODE avoids having to juggle separate
// .env.production / .env.staging files per deploy target.
export const BASE_URL =
    import.meta.env.MODE === "development"
        ? import.meta.env.VITE_LOCAL_API_URL
        : import.meta.env.VITE_GLOBAL_API_URL;
