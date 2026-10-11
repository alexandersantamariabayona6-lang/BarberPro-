import { Directorio } from "@/components/barberias/directorio";
import { barberias } from "@/lib/data/barberias";

export const metadata = { title: "Barberías | BarberPro" };

export default function BarberiasPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Encuentra tu <span className="text-primary">barbería</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Elige tu lugar favorito y reserva en segundos.
        </p>
      </div>
      <Directorio barberias={barberias} />
    </main>
  );
}