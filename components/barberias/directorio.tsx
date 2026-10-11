"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getServicesByShop } from "@/lib/data/queries";
import type { Barbershop } from "@/lib/types";
import { BarberiaCard } from "./barberia-card";

// Ignora mayúsculas y tildes: "medellin" encuentra "Medellín"
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function Directorio({ shops }: { shops: Barbershop[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return shops;
    return shops.filter(
      (s) =>
        normalizar(s.name).includes(q) ||
        normalizar(s.city).includes(q) ||
        normalizar(s.address).includes(q) ||
        getServicesByShop(s.id).some((sv) => normalizar(sv.name).includes(q))
    );
  }, [busqueda, shops]);

  return (
    <div className="space-y-8">
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca por nombre, ciudad o servicio..."
          className="h-12 pl-10"
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No encontramos barberías con esa búsqueda.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((s) => (
            <BarberiaCard key={s.id} shop={s} />
          ))}
        </div>
      )}
    </div>
  );
}