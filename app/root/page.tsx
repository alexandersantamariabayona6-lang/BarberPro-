"use client";

import { useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

function RootContent() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setCopied(false);
    const { data, error } = await supabase.rpc("create_invitation", {
      p_role: "admin",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCode(data as string);
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {}
  }

  return (
    <DashboardShell
      title="Panel root"
      subtitle="Genera códigos para que nuevos dueños registren su barbería."
    >
      <div className="max-w-xl rounded-xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-xl">
          <KeyRound className="size-5 text-gold" />
          Código de invitación para admin
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El código sirve una sola vez y vence en 7 días. Quien se registre con
          él quedará como admin.
        </p>

        <Button
          onClick={generate}
          disabled={loading}
          className="mt-5 bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
        >
          {loading ? "Generando..." : "Generar código"}
        </Button>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        {code && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-gold/40 bg-gold/5 px-4 py-3">
            <span className="font-mono text-xl tracking-widest text-gold-light">
              {code}
            </span>
            <Button variant="outline" size="sm" onClick={copy}>
              <Copy className="mr-1 size-4" />
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function RootPage() {
  return (
    <RoleGuard allow={["root"]}>
      <RootContent />
    </RoleGuard>
  );
}