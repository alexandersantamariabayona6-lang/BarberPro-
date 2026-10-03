"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Scissors, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { homeByRole, useAuth } from "@/lib/auth/auth-context";

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#barberos", label: "Barberos" },
  { href: "#contacto", label: "Contacto" },
];

function AuthActions({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { user, hydrated, logout } = useAuth();
  const outline =
    "border-gold/40 text-gold-light hover:bg-accent hover:text-gold-light";

  if (!hydrated) return null;

  if (!user) {
    return (
      <Button
        asChild
        variant="outline"
        className={`${outline} ${mobile ? "w-full" : ""}`}
      >
        <Link href="/login" onClick={onNavigate}>
          Iniciar sesión
        </Link>
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${mobile ? "w-full" : ""}`}>
      {user.role === "cliente" ? (
        <span
          className={`text-sm text-muted-foreground ${mobile ? "flex-1" : ""}`}
        >
          Hola, {user.name.split(" ")[0]}
        </span>
      ) : (
        <Button
          asChild
          variant="outline"
          className={`${outline} ${mobile ? "flex-1" : ""}`}
        >
          <Link href={homeByRole[user.role]} onClick={onNavigate}>
            Mi panel
          </Link>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cerrar sesión"
        onClick={() => {
          logout();
          onNavigate?.();
        }}
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <Scissors className="size-5 text-gold" />
          <span className="font-heading text-xl text-gold-gradient">
            BarberPro
          </span>
        </Link>

        {/* Escritorio */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-gold-light"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <AuthActions />
          <Button className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90">
            Reservar cita
          </Button>
        </div>

        {/* Celular */}
        <button
          className="text-foreground md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-base text-foreground transition-colors hover:bg-accent hover:text-gold-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex flex-col gap-2 pt-2">
                <AuthActions mobile onNavigate={() => setOpen(false)} />
                <Button className="w-full bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90">
                  Reservar cita
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}