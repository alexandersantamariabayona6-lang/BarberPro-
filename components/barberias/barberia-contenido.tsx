"use client";

import { Star } from "lucide-react";
import { getBarbersByShop, getServicesByShop } from "@/lib/data/queries";
import { formatCOP } from "@/lib/format";
import type { Barbershop } from "@/lib/types";
import { ReservaModal } from "./reserva-modal";

export function BarberiaContenido({ shop }: { shop: Barbershop }) {
  const services = getServicesByShop(shop.id);
  const barbers = getBarbersByShop(shop.id);

  return (
    <>
      {/* Servicios */}
      <section className="mt-12">
        <h2 className="text-2xl">
          Nuestros <span className="text-gold-gradient">servicios</span>
        </h2>
        <ul className="mt-5 space-y-3">
          {services.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="font-heading text-lg text-foreground">
                  {s.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Duración: {s.duration} min
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                <span className="font-heading text-xl text-gold-light">
                  {formatCOP(s.price)}
                </span>
                <ReservaModal shop={shop} service={s} barbers={barbers} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Barberos */}
      <section className="mt-12">
        <h2 className="text-2xl">
          Nuestros <span className="text-gold-gradient">barberos</span>
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {barbers.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/30 font-heading text-lg text-gold">
                {b.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-foreground">{b.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {b.specialty}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm text-gold-light">
                <Star className="size-3.5 fill-gold text-gold" />
                {b.rating}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}