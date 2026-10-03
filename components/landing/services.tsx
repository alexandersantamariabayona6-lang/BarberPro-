"use client";

import { motion } from "framer-motion";
import { Clock, Scissors, Sparkles, Sword, User } from "lucide-react";
import { formatPrice, services, type Service } from "@/lib/data/services";

const icons: Record<Service["icon"], typeof Scissors> = {
  scissors: Scissors,
  beard: User,
  combo: Sparkles,
  razor: Sword,
};

export default function Services() {
  return (
    <section id="servicios" className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
            Lo que hacemos
          </p>
          <h2 className="text-3xl sm:text-5xl">Nuestros servicios</h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gold-gradient" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = icons[service.icon];
            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_0_30px_-10px] hover:shadow-gold/40"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-full border border-gold/30 bg-accent text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-lg text-gold-light">
                    {formatPrice(service.price)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {service.duration} min
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}