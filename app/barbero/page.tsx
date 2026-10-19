"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/layout/dashboard-shell";
import { toDateKey } from "@/lib/booking";
import { getBarberAgenda, type AppointmentView } from "@/lib/data/appointments";

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function toDate(a: AppointmentView) {
  const [y, m, d] = a.date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function BarberContent() {
  const [items, setItems] = useState<AppointmentView[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getBarberAgenda(toDateKey(new Date()))
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell
      title="Mi agenda"
      subtitle="Estas son tus próximas citas."
    >
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : items === null ? (
        <p className="text-muted-foreground">Cargando tu agenda…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No tienes citas por ahora.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-heading text-lg capitalize text-gold-light">
                  {dateFormat.format(toDate(a))} · {a.time}
                </p>
                <p className="text-sm text-foreground">{a.serviceName}</p>
                <p className="text-xs text-muted-foreground">
                  Cliente: {a.clientName}
                </p>
              </div>
              <span className="rounded-full border border-gold/40 px-3 py-1 text-xs capitalize text-gold">
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}

export default function BarberPage() {
  return (
    <RoleGuard allow={["barbero"]}>
      <BarberContent />
    </RoleGuard>
  );
}