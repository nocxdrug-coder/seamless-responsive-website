/**
 * Auth hook backed by a real server-side session cookie.
 * The session is verified on every API call; the cookie is HttpOnly (XSS-safe).
 *
 * We keep a lightweight client-side "logged in" flag in localStorage for:
 *   - Instant UI rendering (no flash of unauthenticated state)
 *   - Navigation guards
 *
 * The real source of truth is always the server session cookie.
 *
 * IMPORTANT: All fetch calls use credentials: "include" to send the
 * HttpOnly cookie with every request.
 */
import { useState, useCallback } from "react";

const AUTH_KEY = "cc_shop_authed";
const USER_KEY = "cc_shop_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTH_KEY) === "true";
  };

  /** Called after a successful /api/login or /api/register response */
  const login = useCallback((userData?: AuthUser) => {
    localStorage.setItem(AUTH_KEY, "true");
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    try {
      await fetch("/api/login?action=logout", { method: "POST", credentials: "include" });
    } catch {
      // session cookie cleared on next request anyway
    }
  }, []);

  /** Refreshes user data from the server */
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const updated: AuthUser = { id: data.id, email: data.email, name: data.name, role: data.role };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        setUser(updated);
        return data;
      }
    } catch {
      // network error — keep cached state
    }
    return null;
  }, []);

  return { isAuthenticated, login, logout, user, refreshUser };
}
