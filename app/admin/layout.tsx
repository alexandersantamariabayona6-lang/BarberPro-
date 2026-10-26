"use client";

import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import ShopGate from "@/components/admin/shop-gate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={["admin"]}>
      <ShopGate>{children}</ShopGate>
    </RoleGuard>
  );
}