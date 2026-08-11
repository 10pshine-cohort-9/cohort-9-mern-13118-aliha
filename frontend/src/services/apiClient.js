import axios from "axios";
const isProd = process.env.NODE_ENV === "production";
const apiBaseUrl =
  process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;

if (isProd && !apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required in production.");
}

if (isProd) {
  console.warn(
    "Auth token is stored in localStorage. Consider using HttpOnly cookies for production.",
  );
}

const apiClient = axios.create({
  baseURL: apiBaseUrl || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
