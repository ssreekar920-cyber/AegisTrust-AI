import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api.js";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("at_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn("Session restore failed:", err.message);
        localStorage.removeItem("at_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem("at_token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      return data;
    } catch (err) {
      toast.error(err.message || "Failed to log in");
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem("at_token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success("Account registered successfully");
      return data;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("at_token");
    setToken(null);
    setUser(null);
    toast.warn("Logged out of AegisTrust AI session");
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
