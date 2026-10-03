"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeByRole, useAuth } from "@/lib/auth/auth-context";
import { users } from "@/lib/data/mock";

const demoAccounts = [
  { id: "u-cliente-1", label: "Cliente", icon: UserRound },
  { id: "u-barbero-1", label: "Barbero", icon: Scissors },
  { id: "u-admin-1", label: "Admin de barbería", icon: Store },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(homeByRole[result.user.role]);
  }

  function enterAs(id: string) {
    const found = loginAs(id);
    if (found) router.push(homeByRole[found.role]);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[110px]"
      />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Scissors className="size-5 text-gold" />
          <span className="font-heading text-2xl text-gold-gradient">
            BarberPro
          </span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entra para reservar o gestionar tu barbería.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              Entrar
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Cuentas de prueba
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            {demoAccounts.map(({ id, label, icon: Icon }) => {
              const account = users.find((u) => u.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => enterAs(id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">
                      Entrar como {label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {account?.email} · demo123
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}