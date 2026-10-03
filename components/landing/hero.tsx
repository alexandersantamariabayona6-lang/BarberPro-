"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stats = [
  { value: "+5", label: "Años de experiencia" },
  { value: "+2.000", label: "Clientes felices" },
  { value: "4.9", label: "Valoración" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-16 pt-24">
      {/* Resplandor dorado de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[120px] sm:h-[600px] sm:w-[600px]"
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-5 text-xs uppercase tracking-[0.3em] text-gold"
        >
          Barbería premium
        </motion.p>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-5xl leading-[1.05] sm:text-6xl md:text-7xl"
        >
          El arte del corte,
          <span className="block text-gold-gradient">reservado en segundos</span>
        </motion.h1>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="my-7 h-px w-24 bg-gold-gradient"
        />

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          Elige tu servicio, tu barbero y tu horario. Sin llamadas, sin
          esperas: solo llegas y disfrutas la experiencia.
        </motion.p>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <Button
            size="lg"
            className="h-12 bg-gold-gradient px-8 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            Reservar cita
            <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-gold/40 px-8 text-base text-gold-light hover:bg-accent hover:text-gold-light"
          >
            Ver servicios
          </Button>
        </motion.div>

        <motion.dl
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-14 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-border pt-8"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-heading text-2xl text-gold-light sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}