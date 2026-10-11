"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BarberiaCard } from "./barberia-card";
import type { Barberia } from "@/lib/types";

export function Directorio({ barberias }: { barberias: Barberia[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return barberias;
    return barberias.filter(
      (b) =>
        b.nombre.toLowerCase().includes(q) ||
        b.barrio.toLowerCase().includes(q) ||
        b.ciudad.toLowerCase().includes(q) ||
        b.servicios.some((s) => s.nombre.toLowerCase().includes(q))
    );
  }, [busqueda, barberias]);

  return (
    <div className="space-y-8">
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca por nombre, barrio o servicio..."
          className="h-12 pl-10"
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No encontramos barberías con esa búsqueda.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((b) => (
            <BarberiaCard key={b.slug} barberia={b} />
          ))}
        </div>
      )}
    </div>
  );
}