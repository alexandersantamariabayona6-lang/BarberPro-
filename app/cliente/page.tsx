"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarX, MapPin, Scissors } from "lucide-react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  cancelAppointment,
  getMyAppointments,
  type AppointmentView,
} from "@/lib/data/appointments";
import { formatCOP } from "@/lib/format";

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function startsAt(a: AppointmentView) {
  const [y, m, d] = a.date.split("-").map(Number);
  const [h, min] = a.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: AppointmentView;
  onCancel?: () => void;
}) {
  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-heading text-lg capitalize text-gold-light">
          {dateFormat.format(startsAt(appointment))} · {appointment.time}
        </p>
        <p className="text-foreground">
          {appointment.serviceName}
          <span className="text-muted-foreground">
            {" "}
            · {formatCOP(appointment.price)}
          </span>
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-gold" />
          {appointment.shopName}
          {appointment.shopAddress && `, ${appointment.shopAddress}`}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Scissors className="size-3.5 shrink-0 text-gold" />
          {appointment.barberName}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <span className="rounded-full border border-gold/40 px-3 py-1 text-xs capitalize text-gold">
          {appointment.status}
        </span>
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Cancelar cita
          </Button>
        )}
      </div>
    </li>
  );
}

function ClientContent() {
  const [items, setItems] = useState<AppointmentView[] | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    getMyAppointments()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  async function cancel(id: string) {
    if (!window.confirm("¿Seguro que quieres cancelar esta cita?")) return;
    try {
      await cancelAppointment(id);
      setError("");
      setRefresh((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cancelar la cita.");
    }
  }

  const now = new Date();
  const upcoming = (items ?? [])
    .filter((a) => a.status !== "cancelada" && startsAt(a) >= now)
    .sort((a, b) => startsAt(a).getTime() - startsAt(b).getTime());
  const history = (items ?? [])
    .filter((a) => a.status === "cancelada" || startsAt(a) < now)
    .sort((a, b) => startsAt(b).getTime() - startsAt(a).getTime());

  return (
    <DashboardShell
      title="Mis citas"
      subtitle="Revisa tus próximas reservas y tu historial."
    >
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {items === null && !error ? (
        <p className="text-muted-foreground">Cargando tus citas…</p>
      ) : (
        <>
          <section>
            <h2 className="text-xl">Próximas citas</h2>
            {upcoming.length === 0 ? (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
                <CalendarX className="size-8 text-gold" />
                <p className="text-muted-foreground">
                  No tienes citas próximas.
                </p>
                <Button
                  asChild
                  className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Link href="/barberias">Reservar una cita</Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    onCancel={() => cancel(a.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          {history.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl">Historial</h2>
              <ul className="mt-4 space-y-3">
                {history.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </DashboardShell>
  );
}

export default function ClientPage() {
  return (
    <RoleGuard allow={["cliente"]}>
      <ClientContent />
    </RoleGuard>
  );
}