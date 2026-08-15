import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import apiClient from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  async function login(email, password) {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { user: loggedInUser } = res.data.data;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      throw error;
    }
  }

  async function signup(name, email, password) {
    try {
      const res = await apiClient.post("/auth/signup", {
        name,
        email,
        password,
      });
      const { user: newUser } = res.data.data;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      throw error;
    }
  }

  async function logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Continue with local cleanup even if the server rejects the logout request.
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }

  const value = { user, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
