import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { BarberiaContenido } from "@/components/barberias/barberia-contenido";
import { getBarbershopBySlug, getBarbershops } from "@/lib/data/queries";

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

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/barberias"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold-light"
      >
        <ArrowLeft className="size-4" />
        Volver a barberías
      </Link>

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

      <BarberiaContenido shop={shop} />
    </main>
  );
}