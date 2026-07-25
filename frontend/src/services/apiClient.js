import axios from 'axios';

/**
 * Shared Axios instance for all backend calls.
 * Every protected endpoint per the STS API contract expects
 * `Authorization: Bearer <token>` — attached automatically here once a
 * token exists (set by the Sprint 3 login flow).
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
