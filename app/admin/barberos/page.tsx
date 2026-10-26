"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy, KeyRound, Pencil, Star, Trash2, UserPlus } from "lucide-react";
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
import {
  createBarberInvitation,
  getPendingBarberInvitations,
  getShopBarbers,
  removeBarber,
  updateBarber,
  type PendingInvitation,
} from "@/lib/data/admin";
import type { ShopBarber } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
});

function BarbersContent() {
  const { user } = useAuth();
  const shopId = user?.shopId;

  const [barbers, setBarbers] = useState<ShopBarber[] | null>(null);
  const [invites, setInvites] = useState<PendingInvitation[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState("");
  const [newCode, setNewCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopBarber | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopId) return;
    let active = true;
    Promise.all([getShopBarbers(shopId), getPendingBarberInvitations()])
      .then(([b, i]) => {
        if (!active) return;
        setBarbers(b);
        setInvites(i);
      })
      .catch((e: Error) => {
        if (active) setNotice(e.message);
      });
    return () => {
      active = false;
    };
  }, [shopId, refresh]);

  async function generateCode() {
    setGenerating(true);
    setNotice("");
    try {
      const code = await createBarberInvitation();
      setNewCode(code);
      setCopied(null);
      setRefresh((r) => r + 1);
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "No pudimos generar el código."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
    } catch {}
  }

  function openEdit(barber: ShopBarber) {
    setEditing(barber);
    setForm({ name: barber.name, specialty: barber.specialty });
    setError("");
    setDialogOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!form.name.trim() || !form.specialty.trim()) {
      setError("El nombre y la especialidad son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await updateBarber(editing.id, {
        name: form.name.trim(),
        specialty: form.specialty.trim(),
      });
      setDialogOpen(false);
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos guardar los cambios."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(barber: ShopBarber) {
    if (!window.confirm(`¿Quitar a ${barber.name} del equipo?`)) return;
    try {
      await removeBarber(barber.id);
      setNotice("");
      setRefresh((r) => r + 1);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "No pudimos quitar al barbero.");
    }
  }

  return (
    <DashboardShell
      title="Barberos"
      subtitle="Invita a tu equipo y administra a tus barberos."
    >
      <AdminNav />

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {barbers === null
            ? "Cargando…"
            : `${barbers.length} ${barbers.length === 1 ? "barbero" : "barberos"}`}
        </p>
        <Button
          onClick={generateCode}
          disabled={generating}
          className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
        >
          <UserPlus className="mr-1 size-4" />
          {generating ? "Generando..." : "Invitar barbero"}
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

      {newCode && (
        <div className="mb-6 rounded-xl border border-gold/40 bg-gold/5 p-5">
          <h2 className="flex items-center gap-2 text-lg">
            <KeyRound className="size-5 text-gold" />
            Código de invitación
          </h2>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="font-mono text-xl tracking-widest text-gold-light">
              {newCode}
            </span>
            <Button variant="outline" size="sm" onClick={() => copy(newCode)}>
              <Copy className="mr-1 size-4" />
              {copied === newCode ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Pásale este código a tu barbero. Debe crear su cuenta en la página
            de registro e ingresarlo ahí. Sirve una sola vez y vence en 7 días.
          </p>
        </div>
      )}

      {invites.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg">Invitaciones pendientes</h2>
          <ul className="mt-3 space-y-2">
            {invites.map((i) => (
              <li
                key={i.code}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="font-mono tracking-widest text-gold-light">
                  {i.code}
                </span>
                <span className="text-muted-foreground">
                  Vence el {dateFormat.format(new Date(i.expiresAt))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {barbers !== null && barbers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aún no tienes barberos. Genera un código e invita al primero.
        </p>
      ) : (
        <ul className="space-y-3">
          {(barbers ?? []).map((b) => (
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
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Editar barbero
            </DialogTitle>
            <DialogDescription>
              Esto es lo que verán los clientes al reservar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barber-name">Nombre</Label>
              <Input
                id="barber-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                disabled={saving}
                className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
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