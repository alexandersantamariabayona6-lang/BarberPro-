"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { users } from "@/lib/data/mock";
import type { Role, User } from "@/lib/types";

export const MOCK_PASSWORD = "demo123";

// A dónde va cada rol después de iniciar sesión
export const homeByRole: Record<Role, string> = {
  cliente: "/barberias",
  barbero: "/barbero",
  admin: "/admin",
};

type LoginResult = { ok: true; user: User } | { ok: false; error: string };

type AuthContextValue = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => LoginResult;
  loginAs: (userId: string) => User | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Sesión falsa guardada en el navegador (solo para la maqueta)
const KEY = "barberpro:user-id";
const EVENT = "barberpro:auth-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function setStoredUser(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const userId = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const user = useMemo(
    () => users.find((u) => u.id === userId) ?? null,
    [userId]
  );

  const login = useCallback((email: string, password: string): LoginResult => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!found || password !== MOCK_PASSWORD) {
      return { ok: false, error: "Correo o contraseña incorrectos" };
    }
    setStoredUser(found.id);
    return { ok: true, user: found };
  }, []);

  const loginAs = useCallback((id: string) => {
    const found = users.find((u) => u.id === id);
    if (!found) return null;
    setStoredUser(found.id);
    return found;
  }, []);

  const logout = useCallback(() => setStoredUser(null), []);

  return (
    <AuthContext.Provider value={{ user, hydrated, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}