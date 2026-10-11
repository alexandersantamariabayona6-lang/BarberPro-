import { Directorio } from "@/components/barberias/directorio";
import { getBarbershops } from "@/lib/data/queries";

export const metadata = { title: "Barberías | BarberPro" };

export default function BarberiasPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl">
          Encuentra tu <span className="text-gold-gradient">barbería</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Elige tu lugar favorito y reserva en segundos.
        </p>
      </div>
      <Directorio shops={getBarbershops()} />
    </main>
  );
}