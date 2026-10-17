"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import RoleGuard from "@/components/auth/role-guard";
import AdminNav from "@/components/admin/admin-nav";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { appointments, barbers, users } from "@/lib/data/mock";
import type { ShopBarber } from "@/lib/types";


type FormState = {
  name: string;
  email: string;
  specialty: string;
};

const emptyForm: FormState = { name: "", email: "", specialty: "" };

function BarbersContent() {
  const { user } = useAuth();
  const shopId = user?.barbershopId;

  const [, setVersion] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopBarber | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const list = barbers.filter((b) => b.barbershopId === shopId);
  const refresh = () => setVersion((v) => v + 1);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(barber: ShopBarber) {
    const account = users.find((u) => u.id === barber.userId);
    setEditing(barber);
    setForm({
      name: barber.name,
      email: account?.email ?? "",
      specialty: barber.specialty,
    });
    setError("");
    setDialogOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const specialty = form.specialty.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!specialty) {
      setError("Cuéntanos en qué se especializa.");
      return;
    }
    if (!shopId) return;

    if (editing) {
      Object.assign(editing, { name, specialty });
      const account = users.find((u) => u.id === editing.userId);
      if (account) account.name = name;
    } else {
      if (!email.includes("@")) {
        setError("Pon un correo válido.");
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === email)) {
        setError("Ya existe una cuenta con ese correo.");
        return;
      }
      const stamp = Date.now();
      users.push({
        id: `u-barbero-${stamp}`,
        name,
        email,
        role: "barbero",
        barbershopId: shopId,
      });
      barbers.push({
        id: `b-${stamp}`,
        userId: `u-barbero-${stamp}`,
        barbershopId: shopId,
        name,
        specialty,
        rating: 5,
      });
    }

    setNotice("");
    setDialogOpen(false);
    refresh();
  }

  function remove(barber: ShopBarber) {
    if (appointments.some((a) => a.barberId === barber.id)) {
      setNotice(
        `No puedes eliminar a ${barber.name} porque tiene citas asociadas.`
      );
      return;
    }
    if (!window.confirm(`¿Quitar a ${barber.name} del equipo?`)) return;

    const barberIndex = barbers.findIndex((b) => b.id === barber.id);
    if (barberIndex !== -1) barbers.splice(barberIndex, 1);
    const userIndex = users.findIndex((u) => u.id === barber.userId);
    if (userIndex !== -1) users.splice(userIndex, 1);

    setNotice("");
    refresh();
  }

  return (
    <DashboardShell
      title="Barberos"
      subtitle="Administra el equipo de tu barbería."
    >
      <AdminNav />

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "barbero" : "barberos"}
        </p>
        <Button
          onClick={openNew}
          className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="mr-1 size-4" />
          Agregar barbero
        </Button>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {notice}
        </p>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aún no tienes barberos. Agrega el primero.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => {
            const account = users.find((u) => u.id === b.userId);
            return (
              <li
                key={b.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/30 font-heading text-lg text-gold">
                    {b.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-foreground">{b.name}</h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {b.specialty}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="flex items-center gap-1 text-sm text-gold-light">
                    <Star className="size-3.5 fill-gold text-gold" />
                    {b.rating}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Editar a ${b.name}`}
                    onClick={() => openEdit(b)}
                    className="border-gold/40 text-gold-light hover:bg-accent hover:text-gold-light"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Quitar a ${b.name}`}
                    onClick={() => remove(b)}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editing ? "Editar barbero" : "Nuevo barbero"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "El correo de la cuenta no se puede cambiar."
                : "Se crea una cuenta de prueba con la contraseña demo123."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barber-name">Nombre</Label>
              <Input
                id="barber-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Daniel Torres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barber-email">Correo</Label>
              <Input
                id="barber-email"
                type="email"
                value={form.email}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="daniel@demo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barber-specialty">Especialidad</Label>
              <Input
                id="barber-specialty"
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
                placeholder="Ej: Fade y diseños"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
              >
                {editing ? "Guardar cambios" : "Agregar barbero"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

export default function AdminBarbersPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <BarbersContent />
    </RoleGuard>
  );
}