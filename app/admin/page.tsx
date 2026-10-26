"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/auth/role-guard";
import AdminNav from "@/components/admin/admin-nav";
import DashboardShell from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getShopCounts } from "@/lib/data/admin";

type Counts = { services: number; barbers: number; appointments: number };

function AdminContent() {
  const { user } = useAuth();
  const shopId = user?.shopId;
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopId) return;
    let active = true;
    getShopCounts(shopId)
      .then((data) => {
        if (active) setCounts(data);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [shopId]);

  const stats = [
    { label: "Servicios", value: counts?.services },
    { label: "Barberos", value: counts?.barbers },
    { label: "Citas", value: counts?.appointments },
  ];

  return (
    <DashboardShell
      title="Panel de administración"
      subtitle="Gestiona los barberos, servicios, precios y horarios de tu barbería."
    >
      <AdminNav />
      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="font-heading text-4xl text-gold-light">
              {stat.value ?? "–"}
            </p>
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