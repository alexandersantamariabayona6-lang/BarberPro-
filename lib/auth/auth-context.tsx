"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Role, User } from "@/lib/types";

// Contraseña de las cuentas de demostración (@demo.com)
export const MOCK_PASSWORD = "demo123";

// A dónde va cada rol después de iniciar sesión
export const homeByRole: Record<Role, string> = {
  cliente: "/barberias",
  barbero: "/barbero",
  admin: "/admin",
  root: "/root",
};

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  code?: string;
};

type AuthContextValue = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginAs: (email: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Convierte el usuario de Supabase en el usuario que entiende la app
async function fetchAppUser(authUser: {
  id: string;
  email?: string | null;
}): Promise<User | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role, barbershop_id")
    .eq("id", authUser.id)
    .single();

  if (error || !profile) return null;

  const shopId: string | undefined = profile.barbershop_id ?? undefined;

  return {
    id: authUser.id,
    name: profile.full_name,
    email: authUser.email ?? "",
    role: profile.role as Role,
    barbershopId: shopId,
    shopId,
  };
}

function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered")) return "Ese correo ya tiene una cuenta.";
  if (m.includes("password"))
    return "La contraseña no es válida. Usa al menos 6 caracteres.";
  if (m.includes("rate limit"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  return "No pudimos crear la cuenta. Inténtalo de nuevo.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function sync(session: Session | null) {
      if (!session) {
        if (active) setUser(null);
        return;
      }
      const appUser = await fetchAppUser(session.user);
      if (active) setUser(appUser);
    }

    supabase.auth.getSession().then(async ({ data }) => {
      await sync(data.session);
      if (active) setHydrated(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Se difiere para no llamar a Supabase dentro del propio callback
        setTimeout(() => {
          void sync(session);
        }, 0);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) {
        return { ok: false, error: "Correo o contraseña incorrectos" };
      }
      const appUser = await fetchAppUser(data.user);
      if (!appUser) {
        return { ok: false, error: "No encontramos el perfil de esta cuenta" };
      }
      setUser(appUser);
      return { ok: true, user: appUser };
    },
    []
  );

  const loginAs = useCallback(
    (email: string) => login(email, MOCK_PASSWORD),
    [login]
  );

  const register = useCallback(
    async ({
      name,
      email,
      password,
      code,
    }: RegisterInput): Promise<AuthResult> => {
      const invitation = code?.trim();

      // Si trae código, se revisa antes de crear la cuenta
      if (invitation) {
        const { data: role, error } = await supabase.rpc("check_invitation", {
          p_code: invitation,
        });
        if (error || !role) {
          return {
            ok: false,
            error: "El código de invitación no es válido o ya venció.",
          };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) return { ok: false, error: friendlyError(error.message) };
      if (!data.user || !data.session) {
        return {
          ok: false,
          error: "Revisa tu correo para confirmar la cuenta antes de entrar.",
        };
      }

      if (invitation) {
        const { error: redeemError } = await supabase.rpc(
          "redeem_invitation",
          { p_code: invitation }
        );
        if (redeemError) {
          return {
            ok: false,
            error:
              "Tu cuenta se creó como cliente, pero el código ya no es válido.",
          };
        }
      }

      const appUser = await fetchAppUser(data.user);
      if (!appUser) {
        return { ok: false, error: "No pudimos cargar tu perfil." };
      }
      setUser(appUser);
      return { ok: true, user: appUser };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Vuelve a leer el perfil (por ejemplo, después de crear la barbería)
  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setUser(null);
      return;
    }
    setUser(await fetchAppUser(data.session.user));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, hydrated, login, loginAs, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}