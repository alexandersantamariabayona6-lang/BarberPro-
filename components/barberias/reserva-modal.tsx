"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/auth-context";
import { appointments } from "@/lib/data/mock";
import {
  getAvailableDays,
  getAvailableSlots,
  toDateKey,
} from "@/lib/booking";
import { formatCOP } from "@/lib/format";
import type { Barbershop, ShopBarber, ShopService } from "@/lib/types";

type Props = {
  shop: Barbershop;
  service: ShopService;
  barbers: ShopBarber[];
};

type Step = "barbero" | "horario" | "confirmar" | "listo";

const stepNumber: Record<Step, number> = {
  barbero: 1,
  horario: 2,
  confirmar: 3,
  listo: 3,
};

const chipBase = "rounded-lg border px-3 py-2 text-sm transition-colors";
const chipOn = "border-gold bg-gold/10 text-gold-light";
const chipOff = "border-border text-foreground hover:border-gold/50";

export function ReservaModal({ shop, service, barbers }: Props) {
  const { user, hydrated } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("barbero");
  const [barberId, setBarberId] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const days = useMemo(() => getAvailableDays(shop), [shop]);
  const barber = barbers.find((b) => b.id === barberId);
  const day = days.find((d) => toDateKey(d) === dateKey);

  const slots =
    barber && day ? getAvailableSlots(shop, service, barber.id, day) : [];

  function onOpenChange(value: boolean) {
    setOpen(value);
    if (value) {
      setStep("barbero");
      setBarberId(null);
      setDateKey(null);
      setTime(null);
    }
  }

  function confirmar() {
    if (!user || !barber || !dateKey || !time) return;
    appointments.push({
      id: `a-${Date.now()}`,
      barbershopId: shop.id,
      barberId: barber.id,
      serviceId: service.id,
      clientId: user.id,
      date: dateKey,
      time,
      status: "pendiente",
    });
    setStep("listo");
  }

  const weekday = new Intl.DateTimeFormat("es-CO", { weekday: "short" });
  const fullDate = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90">
          Reservar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Reservar: {service.name}
          </DialogTitle>
          <DialogDescription>
            {shop.name} · {formatCOP(service.price)} · {service.duration} min
          </DialogDescription>
        </DialogHeader>

        {!hydrated ? null : !user ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-muted-foreground">
              Inicia sesión como cliente para reservar tu cita.
            </p>
            <Button
              asChild
              className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        ) : user.role !== "cliente" ? (
          <p className="py-4 text-center text-muted-foreground">
            Las reservas solo están disponibles para cuentas de cliente.
          </p>
        ) : (
          <div className="space-y-5">
            {step !== "listo" && (
              <p className="text-xs uppercase tracking-widest text-gold">
                Paso {stepNumber[step]} de 3
              </p>
            )}

            {/* Paso 1: barbero */}
            {step === "barbero" && (
              <div className="space-y-3">
                <h3 className="text-base text-foreground">Elige tu barbero</h3>
                {barbers.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBarberId(b.id);
                      setDateKey(null);
                      setTime(null);
                      setStep("horario");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-gold/50 hover:bg-accent"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/30 font-heading text-gold">
                      {b.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">
                        {b.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {b.specialty}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gold-light">
                      <Star className="size-3.5 fill-gold text-gold" />
                      {b.rating}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Paso 2: fecha y hora */}
            {step === "horario" && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <h3 className="text-base text-foreground">Elige el día</h3>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {days.map((d) => {
                      const key = toDateKey(d);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setDateKey(key);
                            setTime(null);
                          }}
                          className={`${chipBase} text-center ${
                            dateKey === key ? chipOn : chipOff
                          }`}
                        >
                          <span className="block text-xs capitalize text-muted-foreground">
                            {weekday.format(d).replace(".", "")}
                          </span>
                          <span className="block font-heading text-lg">
                            {d.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {day && (
                  <div className="space-y-3">
                    <h3 className="text-base text-foreground">Elige la hora</h3>
                    {slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay horarios disponibles este día. Prueba con otro.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slots.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setTime(s)}
                            className={`${chipBase} ${
                              time === s ? chipOn : chipOff
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setStep("barbero")}>
                    Atrás
                  </Button>
                  <Button
                    disabled={!time}
                    onClick={() => setStep("confirmar")}
                    className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 3: confirmar */}
            {step === "confirmar" && barber && day && time && (
              <div className="space-y-5">
                <h3 className="text-base text-foreground">
                  Revisa tu reserva
                </h3>
                <dl className="space-y-3 rounded-lg border border-border bg-background/40 p-4 text-sm">
                  {[
                    ["Barbería", shop.name],
                    ["Servicio", service.name],
                    ["Barbero", barber.name],
                    ["Fecha", fullDate.format(day)],
                    ["Hora", time],
                    ["Total", formatCOP(service.price)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="text-right capitalize text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex justify-between gap-3">
                  <Button variant="ghost" onClick={() => setStep("horario")}>
                    Atrás
                  </Button>
                  <Button
                    onClick={confirmar}
                    className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Confirmar reserva
                  </Button>
                </div>
              </div>
            )}

            {/* Listo */}
            {step === "listo" && barber && day && time && (
              <div className="space-y-4 py-4 text-center">
                <CheckCircle2 className="mx-auto size-14 text-gold" />
                <h3 className="font-heading text-2xl text-foreground">
                  ¡Reserva creada!
                </h3>
                <p className="text-sm capitalize text-muted-foreground">
                  {service.name} con {barber.name}
                  <br />
                  {fullDate.format(day)} · {time}
                </p>
                <p className="text-xs text-muted-foreground">
                  Queda pendiente de confirmación por la barbería.
                </p>
                <Button
                  onClick={() => setOpen(false)}
                  className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}