import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { ShopWithDetails } from "@/lib/data/queries";
import { formatCOP } from "@/lib/format";

export function BarberiaCard({ shop }: { shop: ShopWithDetails }) {
  const minPrice = shop.services.length
    ? Math.min(...shop.services.map((s) => s.price))
    : null;
  const barberCount = shop.barbers.length;

  return (
    <Link href={`/barberias/${shop.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold/50">
        {/* Placeholder de imagen; luego se cambia por la foto real */}
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-gold/20">
          <span className="font-heading text-5xl text-gold-gradient">
            {shop.name.charAt(0)}
          </span>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-xl leading-tight text-foreground">
              {shop.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-gold/40 px-2.5 py-0.5 text-xs text-gold-light">
              <Star className="size-3 fill-gold text-gold" />
              {shop.rating}
            </span>
          </div>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-gold" />
            {shop.address}, {shop.city}
          </p>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {shop.description}
          </p>

          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">
              {barberCount} {barberCount === 1 ? "barbero" : "barberos"}
            </span>
            {minPrice !== null && (
              <span className="font-semibold text-gold-light">
                Desde {formatCOP(minPrice)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}