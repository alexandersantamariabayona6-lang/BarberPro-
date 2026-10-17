import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getBarbershopBySlug,
  getBarbershops,
  getBarbersByShop,
  getServicesByShop,
} from "@/lib/data/queries";
import { formatCOP } from "@/lib/format";
import { ReservaModal } from "@/components/barberias/reserva-modal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getBarbershops().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const shop = getBarbershopBySlug(slug);
  return { title: shop ? `${shop.name} | BarberPro` : "Barbería | BarberPro" };
}

export default async function BarberiaPage({ params }: Props) {
  const { slug } = await params;
  const shop = getBarbershopBySlug(slug);
  if (!shop) notFound();

  const services = getServicesByShop(shop.id);
  const barbers = getBarbersByShop(shop.id);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/barberias"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold-light"
      >
        <ArrowLeft className="size-4" />
        Volver a barberías
      </Link>

      {/* Encabezado */}
      <header className="relative overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gold/10 blur-[90px]"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl">{shop.name}</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {shop.description}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-gold" />
                {shop.address}, {shop.city}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-gold" />
                {shop.openHours}
              </li>
            </ul>
          </div>
          <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-sm text-gold-light">
            <Star className="size-4 fill-gold text-gold" />
            {shop.rating}
          </span>
        </div>
      </header>

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
    </main>
  );
}