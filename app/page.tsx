import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">
        Barbería premium
      </p>
      <h1 className="text-5xl sm:text-7xl text-gold-gradient">BarberPro</h1>
      <p className="max-w-md text-muted-foreground">
        El arte del corte, reservado en segundos.
      </p>
      <Button size="lg">Reservar cita</Button>
    </main>
  );
}