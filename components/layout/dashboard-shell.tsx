"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { barbershops } from "@/lib/data/mock";

export default function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const shop = barbershops.find((b) => b.id === user?.barbershopId);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="size-5 text-gold" />
            <span className="font-heading text-xl text-gold-gradient">
              BarberPro
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <p className="text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{shop?.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-gold/40 text-gold-light hover:bg-accent hover:text-gold-light"
            >
              <LogOut className="size-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}