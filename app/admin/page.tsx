"use client";

import RoleGuard from "@/components/auth/role-guard";
import AdminNav from "@/components/admin/admin-nav";
import DashboardShell from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { appointments, barbers, services } from "@/lib/data/mock";

function AdminContent() {
  const { user } = useAuth();
  const shopId = user?.barbershopId;

  const stats = [
    { label: "Servicios", value: services.filter((s) => s.barbershopId === shopId).length },
    { label: "Barberos", value: barbers.filter((b) => b.barbershopId === shopId).length },
    { label: "Citas", value: appointments.filter((a) => a.barbershopId === shopId).length },
  ];

  return (
    <DashboardShell
      title="Panel de administración"
      subtitle="Gestiona los barberos, servicios, precios y horarios de tu barbería."
    >
      <AdminNav />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="font-heading text-4xl text-gold-light">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <AdminContent />
    </RoleGuard>
  );
}