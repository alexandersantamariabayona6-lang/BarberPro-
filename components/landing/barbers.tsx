"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { barbers } from "@/lib/data/barbers";
import { Button } from "@/components/ui/button";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

export default function Barbers() {
  return (
    <section
      id="barberos"
      className="border-t border-border bg-card/40 px-5 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
            El equipo
          </p>
          <h2 className="text-3xl sm:text-5xl">Nuestros barberos</h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gold-gradient" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {barbers.map((barber, i) => (
            <motion.article
              key={barber.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-gold/50"
            >
              {/* Avatar provisional: luego se cambia por foto real */}
              <div className="mx-auto flex size-24 items-center justify-center rounded-full border-2 border-gold/60 bg-accent font-heading text-3xl text-gold-light">
                {initials(barber.name)}
              </div>

              <h3 className="mt-5 text-xl">{barber.name}</h3>
              <p className="mt-1 text-sm text-gold">{barber.role}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {barber.specialty}
              </p>

              <div className="mt-5 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-gold text-gold" />
                  {barber.rating}
                </span>
                <span className="h-4 w-px bg-border" />
                <span>{barber.years} años</span>
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full border-gold/40 text-gold-light hover:bg-accent hover:text-gold-light"
              >
                Reservar con {barber.name.split(" ")[0]}
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}