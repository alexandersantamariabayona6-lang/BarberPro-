"use client";

import { useState } from "react";
import { CalendarX, Scissors, UserRound } from "lucide-react";
import RoleGuard from "@/components/auth/role-guard";
import AdminNav from "@/components/admin/admin-nav";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { appointments, barbers, services, users } from "@/lib/data/mock";
import { formatCOP } from "@/lib/format";
import type { Appointment } from "@/lib/types";

type StatusFilter = "todas" | "pendiente" | "confirmada";

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const chipBase = "rounded-full border px-4 py-1.5 text-sm transition-colors";
const chipOn = "border-gold bg-gold/10 text-gold-light";
const chipOff =
  "border-border text-muted-foreground hover:border-gold/50 hover:text-gold-light";

function startsAt(a: Appointment) {
  const [y, m, d] = a.date.split("-").map(Number);
  const [h, min] = a.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

function AppointmentRow({
  appointment,
  onConfirm,
  onCancel,
}: {
  appointment: Appointment;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const service = services.find((s) => s.id === appointment.serviceId);
  const barber = barbers.find((b) => b.id === appointment.barberId);
  const client = users.find((u) => u.id === appointment.clientId);

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-heading text-lg capitalize text-gold-light">
          {dateFormat.format(startsAt(appointment))} · {appointment.time}
        </p>
        <p className="text-foreground">
          {service?.name}
          {service && (
            <span className="text-muted-foreground">
              {" "}
              · {formatCOP(service.price)}
            </span>
          )}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <UserRound className="size-3.5 shrink-0 text-gold" />
          Cliente: {client?.name}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Scissors className="size-3.5 shrink-0 text-gold" />
          Barbero: {barber?.name}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <span className="rounded-full border border-gold/40 px-3 py-1 text-xs capitalize text-gold">
          {appointment.status}
        </span>
        <div className="flex gap-2">
          {onConfirm && (
            <Button
              size="sm"
              onClick={onConfirm}
              className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              Confirmar
            </Button>
          )}
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function AppointmentsContent() {
  const { user } = useAuth();
  const shopId = user?.barbershopId;

  const [, setVersion] = useState(0);
  const [barberFilter, setBarberFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");

  const refresh = () => setVersion((v) => v + 1);
  const shopBarbers = barbers.filter((b) => b.barbershopId === shopId);
  const now = new Date();

  const filtered = appointments.filter(
    (a) =>
      a.barbershopId === shopId &&
      (barberFilter === "todos" || a.barberId === barberFilter) &&
      (statusFilter === "todas" || a.status === statusFilter)
  );

  const upcoming = filtered
    .filter((a) => startsAt(a) >= now)
    .sort((a, b) => startsAt(a).getTime() - startsAt(b).getTime());
  const past = filtered
    .filter((a) => startsAt(a) < now)
    .sort((a, b) => startsAt(b).getTime() - startsAt(a).getTime());

  const pendingCount = appointments.filter(
    (a) =>
      a.barbershopId === shopId &&
      a.status === "pendiente" &&
      startsAt(a) >= now
  ).length;

  function confirm(appointment: Appointment) {
    appointment.status = "confirmada";
    refresh();
  }

  function cancel(appointment: Appointment) {
    const client = users.find((u) => u.id === appointment.clientId);
    if (!window.confirm(`¿Cancelar la cita de ${client?.name ?? "este cliente"}?`))
      return;
    const index = appointments.findIndex((a) => a.id === appointment.id);
    if (index !== -1) appointments.splice(index, 1);
    refresh();
  }

  return (
    <DashboardShell
      title="Citas"
      subtitle="Revisa, confirma y cancela las reservas de tu barbería."
    >
      <AdminNav />

      <p className="mb-5 text-sm text-muted-foreground">
        {pendingCount === 0
          ? "No tienes citas pendientes por confirmar."
          : `Tienes ${pendingCount} ${
              pendingCount === 1 ? "cita pendiente" : "citas pendientes"
            } por confirmar.`}
      </p>

      {/* Filtros */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBarberFilter("todos")}
            className={`${chipBase} ${barberFilter === "todos" ? chipOn : chipOff}`}
          >
            Todos los barberos
          </button>
          {shopBarbers.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBarberFilter(b.id)}
              className={`${chipBase} ${barberFilter === b.id ? chipOn : chipOff}`}
            >
              {b.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todas", "Todas"],
              ["pendiente", "Pendientes"],
              ["confirmada", "Confirmadas"],
            ] as [StatusFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`${chipBase} ${statusFilter === value ? chipOn : chipOff}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section>
        <h2 className="text-xl">Próximas citas</h2>
        {upcoming.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
            <CalendarX className="size-8 text-gold" />
            <p className="text-muted-foreground">
              No hay citas próximas con estos filtros.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((a) => (
              <AppointmentRow
                key={a.id}
                appointment={a}
                onConfirm={
                  a.status === "pendiente" ? () => confirm(a) : undefined
                }
                onCancel={() => cancel(a)}
              />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl">Citas anteriores</h2>
          <ul className="mt-4 space-y-3">
            {past.map((a) => (
              <AppointmentRow key={a.id} appointment={a} />
            ))}
          </ul>
        </section>
      )}
    </DashboardShell>
  );
}

export default function AdminAppointmentsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <AppointmentsContent />
    </RoleGuard>
  );
}