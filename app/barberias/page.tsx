import { Directorio } from "@/components/barberias/directorio";
import { getDirectory } from "@/lib/data/queries";

export const metadata = { title: "Barberías | BarberPro" };
export const dynamic = "force-dynamic";

export default async function BarberiasPage() {
  const shops = await getDirectory();

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
      <Directorio shops={shops} />
    </main>
  );
}