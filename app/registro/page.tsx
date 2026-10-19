"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeByRole, useAuth } from "@/lib/auth/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const result = await register({ name, email, password, code });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(homeByRole[result.user.role]);
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
          <h1 className="text-2xl">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Regístrate para reservar tus citas.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código de invitación (opcional)</Label>
              <Input
                id="code"
                placeholder="BP-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">
                Si eres dueño de una barbería o barbero, ingresa el código que
                te dieron. Si no, déjalo vacío.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-gold-light hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}