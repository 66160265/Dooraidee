// In dev this falls back to the local backend; in production it's set via
// the VITE_API_URL environment variable on whatever host serves the build
// (Vite only exposes env vars prefixed with VITE_ to client code).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
