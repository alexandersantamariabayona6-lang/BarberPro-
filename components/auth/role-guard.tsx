"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { homeByRole, useAuth } from "@/lib/auth/auth-context";
import type { Role } from "@/lib/types";

export default function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const allowKey = allow.join(",");
  const allowed = !!user && allowKey.split(",").includes(user.role);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (!allowKey.split(",").includes(user.role)) {
      router.replace(homeByRole[user.role]);
    }
  }, [hydrated, user, allowKey, router]);

  if (!hydrated || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return <>{children}</>;
}