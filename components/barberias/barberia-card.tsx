import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatoCOP, precioDesde } from "@/lib/data/barberias";
import type { Barberia } from "@/lib/types";

export function BarberiaCard({ barberia }: { barberia: Barberia }) {
  return (
    <Link href={`/barberias/${barberia.slug}`} className="group block">
      <Card className="overflow-hidden border-primary/20 bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/10">
        {/* Placeholder de imagen; luego se cambia por la foto real */}
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-primary/30">
          <span className="text-5xl font-bold text-primary/80">
            {barberia.nombre.charAt(0)}
          </span>
        </div>

        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight">{barberia.nombre}</h3>
            <Badge variant="secondary" className="flex shrink-0 items-center gap-1">
              <Star className="size-3 fill-primary text-primary" />
              {barberia.calificacion}
            </Badge>
          </div>

          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {barberia.barrio}, {barberia.ciudad}
          </p>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {barberia.descripcion}
          </p>

          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="text-muted-foreground">
              {barberia.barberos.length} barberos
            </span>
            <span className="font-semibold text-primary">
              Desde {formatoCOP(precioDesde(barberia))}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}