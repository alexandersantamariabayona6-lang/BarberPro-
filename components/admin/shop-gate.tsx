"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { createBarbershop } from "@/lib/data/admin";

export default function ShopGate({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    days: "Lun–Sáb",
    open: "09:00",
    close: "19:00",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (user?.shopId) return <>{children}</>;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      setError("Nombre, ciudad y dirección son obligatorios.");
      return;
    }
    if (form.close <= form.open) {
      setError("La hora de cierre debe ser posterior a la de apertura.");
      return;
    }
    setSaving(true);
    try {
      await createBarbershop({
        name: form.name.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        openHours: `${form.days} · ${form.open} a ${form.close}`,
      });
      await refreshUser();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos crear la barbería."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell
      title="Crea tu barbería"
      subtitle="Cuéntanos lo básico para publicarla. Después agregas tus servicios y tu equipo."
    >
      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="shop-name">Nombre de la barbería</Label>
          <Input
            id="shop-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: La Navaja Dorada"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shop-city">Ciudad</Label>
            <Input
              id="shop-city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Bucaramanga"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-address">Dirección</Label>
            <Input
              id="shop-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Cra. 27 #36-20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shop-description">Descripción</Label>
          <Input
            id="shop-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Una frase que describa tu barbería"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="shop-days">Días</Label>
            <select
              id="shop-days"
              value={form.days}
              onChange={(e) => setForm({ ...form, days: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="Lun–Sáb">Lun – Sáb</option>
              <option value="Lun–Dom">Lun – Dom</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-open">Abre</Label>
            <Input
              id="shop-open"
              type="time"
              value={form.open}
              onChange={(e) => setForm({ ...form, open: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-close">Cierra</Label>
            <Input
              id="shop-close"
              type="time"
              value={form.close}
              onChange={(e) => setForm({ ...form, close: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={saving}
          className="h-11 w-full bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
        >
          {saving ? "Creando..." : "Crear mi barbería"}
        </Button>
      </form>
    </DashboardShell>
  );
}