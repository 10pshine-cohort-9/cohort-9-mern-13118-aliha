import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Holds the current authenticated user + token for the whole app.
 * Sprint 1 scaffold only: no login/signup wiring yet (that's the next
 * Sprint 1 backend task, followed by Sprint 3 frontend wiring against it).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const value = { user, setUser, token, setToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
