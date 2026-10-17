"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { appointments, services } from "@/lib/data/mock";
import { formatCOP } from "@/lib/format";
import type { ShopService } from "@/lib/types";

type FormState = {
  name: string;
  description: string;
  price: string;
  duration: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  duration: "",
};

function ServicesContent() {
  const { user } = useAuth();
  const shopId = user?.barbershopId;

  const [, setVersion] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopService | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const list = services.filter((s) => s.barbershopId === shopId);
  const refresh = () => setVersion((v) => v + 1);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(service: ShopService) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
    });
    setError("");
    setDialogOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Pon un precio válido.");
      return;
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      setError("La duración debe ser un número entero de minutos.");
      return;
    }
    if (!shopId) return;

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      duration,
    };

    if (editing) {
      Object.assign(editing, data);
    } else {
      services.push({ id: `sv-${Date.now()}`, barbershopId: shopId, ...data });
    }

    setNotice("");
    setDialogOpen(false);
    refresh();
  }

  function remove(service: ShopService) {
    if (appointments.some((a) => a.serviceId === service.id)) {
      setNotice(
        `No puedes eliminar "${service.name}" porque tiene citas asociadas.`
      );
      return;
    }
    if (!window.confirm(`¿Eliminar el servicio "${service.name}"?`)) return;
    const index = services.findIndex((s) => s.id === service.id);
    if (index !== -1) services.splice(index, 1);
    setNotice("");
    refresh();
  }

  return (
    <DashboardShell
      title="Servicios"
      subtitle="Administra los servicios, precios y duración de tu barbería."
    >
      <AdminNav />

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "servicio" : "servicios"}
        </p>
        <Button
          onClick={openNew}
          className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="mr-1 size-4" />
          Agregar servicio
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
          Aún no tienes servicios. Agrega el primero.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="font-heading text-lg text-foreground">
                  {s.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.duration} min
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="font-heading text-xl text-gold-light">
                  {formatCOP(s.price)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Editar ${s.name}`}
                  onClick={() => openEdit(s)}
                  className="border-gold/40 text-gold-light hover:bg-accent hover:text-gold-light"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Eliminar ${s.name}`}
                  onClick={() => remove(s)}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editing ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
            <DialogDescription>
              Lo que pongas aquí es lo que verán los clientes al reservar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Corte infantil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Qué incluye el servicio"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (COP)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="35000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="40"
                />
              </div>
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
                {editing ? "Guardar cambios" : "Agregar servicio"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

export default function AdminServicesPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <ServicesContent />
    </RoleGuard>
  );
}