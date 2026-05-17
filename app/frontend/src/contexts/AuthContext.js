import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "swapwear_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const login = (authData) => {
    const nextUser = authData?.user || authData;
    if (authData?.token) localStorage.setItem("swapwear_token", authData.token);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("swapwear_token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      login(res.data);
      return res.data;
    } catch {
      return user;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.is_admin) return <Navigate to="/" replace />;
  return children;
}
