"use client";

import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { appointments, barbers, services, users } from "@/lib/data/mock";

function BarberContent() {
  const { user } = useAuth();
  const me = barbers.find((b) => b.userId === user?.id);
  const mine = appointments.filter((a) => a.barberId === me?.id);

  return (
    <DashboardShell
      title="Mi agenda"
      subtitle="Estas son tus próximas citas."
    >
      {mine.length === 0 ? (
        <p className="text-muted-foreground">No tienes citas por ahora.</p>
      ) : (
        <ul className="space-y-3">
          {mine.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-heading text-lg text-gold-light">
                  {a.date} · {a.time}
                </p>
                <p className="text-sm text-foreground">
                  {services.find((s) => s.id === a.serviceId)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cliente: {users.find((u) => u.id === a.clientId)?.name}
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