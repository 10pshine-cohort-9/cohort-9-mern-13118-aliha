import axios from "axios";

const viteEnv = (() => {
  try {
    return Function("return import.meta.env")();
  } catch {
    return {};
  }
})();

const isProd =
  viteEnv.PROD ??
  (typeof process !== "undefined" && process.env.NODE_ENV === "production");
const apiBaseUrl = viteEnv.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;

if (isProd && !apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required in production.");
}

const apiClient = axios.create({
  baseURL: apiBaseUrl || "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const csrfCookie =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((entry) => entry.startsWith("csrfToken="))
      : null;

  if (csrfCookie) {
    const csrfToken = decodeURIComponent(csrfCookie.split("=")[1]);
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

export default apiClient;
