import axios from 'axios';

/**
 * Shared Axios instance for all backend calls.
 * Every protected endpoint per the STS API contract expects
 * `Authorization: Bearer <token>` — attached automatically here once a
 * token exists (set by the Sprint 3 login flow).
 *
 * SECURITY TRADE-OFF (accepted, not accidental): the JWT is persisted in
 * localStorage so it survives a page refresh. localStorage is readable by
 * any script in the page, so a successful XSS on this app could exfiltrate
 * the token and reuse it until it expires (JWT_EXPIRES_IN, default 1h).
 *
 * The stronger alternative is an HttpOnly, Secure, SameSite cookie-based
 * session, which JS can never read even during an XSS — but that requires
 * backend Set-Cookie handling, CSRF protection, and CORS changes to allow
 * credentials, none of which exist yet. Revisit before this app handles
 * anything more sensitive than personal notes, or before a production
 * deploy. Until then: keep JWT_EXPIRES_IN short, and treat any XSS finding
 * elsewhere in the app as critical specifically because of this.
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
