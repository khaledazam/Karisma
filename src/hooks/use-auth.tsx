import { createContext, useContext, useEffect, useState } from "react";
import { staffLoginServerFn } from "@/lib/server-actions";
import type { StaffRole } from "@/lib/db";

export type { StaffRole };

export interface StaffSession {
  username: string;
  displayName: string;
  role: StaffRole;
  permissions: string[]; // e.g. ["products","orders","customers","staff"]
}

type AuthContextValue = {
  isAdmin: boolean;        // true if any staff role logged in
  isSuperAdmin: boolean;   // true only if role === "admin"
  session: StaffSession | null;
  hasPermission: (tab: string) => boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "karisma-staff-session-v2";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StaffSession;
        if (parsed?.username && parsed?.role) {
          setSession(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await staffLoginServerFn({ data: { username, password: pass } });
      if (res?.success && res.user) {
        const s: StaffSession = {
          username: res.user.username,
          displayName: res.user.displayName,
          role: res.user.role,
          permissions: res.user.permissions,
        };
        setSession(s);
        try { window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(s)); } catch {}
        return true;
      }
    } catch (e) {
      console.warn("[Auth] Login error:", e);
    }
    return false;
  };

  const logout = () => {
    setSession(null);
    try { window.localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
  };

  const hasPermission = (tab: string): boolean => {
    if (!session) return false;
    return session.permissions.includes(tab);
  };

  const isAdmin = !!session;
  const isSuperAdmin = session?.role === "admin";

  return (
    <AuthContext.Provider value={{ isAdmin, isSuperAdmin, session, hasPermission, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
