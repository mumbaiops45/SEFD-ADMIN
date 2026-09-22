"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { decodeJwt } from "@/lib/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("sfed_token");
    const email = localStorage.getItem("sfed_email");
    if (token) {
      const payload = decodeJwt(token);
      const valid = payload && payload.role === "admin" && (!payload.exp || payload.exp * 1000 > Date.now());
      if (valid) {
        setUser({ id: payload._id, role: payload.role, email: email || "" });
      } else {
        localStorage.removeItem("sfed_token");
        localStorage.removeItem("sfed_email");
      }
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const token = res?.data?.token;
    if (!token) throw new Error("Login failed");

    const payload = decodeJwt(token);
    if (!payload || payload.role !== "admin") {
      throw new Error("This account is not an admin. Access denied.");
    }

    localStorage.setItem("sfed_token", token);
    localStorage.setItem("sfed_email", email);
    const nextUser = { id: payload._id, role: payload.role, email };
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sfed_token");
    localStorage.removeItem("sfed_email");
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
