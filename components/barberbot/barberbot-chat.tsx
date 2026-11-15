"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Bot, CalendarCheck, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { createAppointment } from "@/lib/data/appointments";
import { formatCOP } from "@/lib/format";

type Proposal = {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
};

type Item = {
  id: number;
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
  proposal?: Proposal;
  status?: "idle" | "saving" | "done" | "replaced";
  cardError?: string;
};

const GREETING: Item = {
  id: 0,
  role: "assistant",
  text: "¡Hola! Soy BarberBot. Te ayudo a reservar tu cita: dime qué servicio quieres, con qué barbero y cuándo.",
};

const SUGGESTIONS = [
  "¿Qué servicios tienen?",
  "Quiero reservar un corte",
  "¿Qué horarios hay mañana?",
];

const fullDate = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return fullDate.format(new Date(y, m - 1, d));
}

export default function BarberBotChat({
  slug,
  shopName,
}: {
  slug: string;
  shopName: string;
}) {
  const { user, hydrated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Item[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  function patch(id: number, changes: Partial<Item>) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
    );
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;

    const userMsg: Item = { id: nextId.current++, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/barberbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          messages: history
            .filter((m) => m.id !== 0 && !m.isError)
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "BarberBot no pudo responder.");

      const proposal = (data.proposal ?? undefined) as Proposal | undefined;
      const reply: Item = {
        id: nextId.current++,
        role: "assistant",
        text: data.reply as string,
        proposal,
        status: proposal ? "idle" : undefined,
      };
      setMessages((prev) => [
        // Si llega una propuesta nueva, las anteriores quedan sin efecto
        ...prev.map((m) =>
          proposal && m.status === "idle" ? { ...m, status: "replaced" as const } : m
        ),
        reply,
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          isError: true,
          text:
            e instanceof Error
              ? e.message
              : "BarberBot no pudo responder. Inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function confirm(item: Item) {
    const p = item.proposal;
    if (!p) return;
    patch(item.id, { status: "saving", cardError: undefined });
    try {
      await createAppointment({
        serviceId: p.serviceId,
        barberId: p.barberId,
        date: p.date,
        time: p.time,
      });
      patch(item.id, { status: "done" });
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          text: "¡Listo! Tu cita quedó reservada y pendiente de confirmación por la barbería. La ves en Mis citas.",
        },
      ]);
    } catch (e) {
      patch(item.id, {
        status: "idle",
        cardError:
          e instanceof Error ? e.message : "No pudimos crear la reserva.",
      });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const canBook = user?.role === "cliente";

  return (
    <>
      {open && (
        <section
          aria-label="BarberBot"
          className="fixed bottom-24 right-4 z-50 flex h-[32rem] max-h-[calc(100dvh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-gold/40 bg-card shadow-2xl sm:right-6 sm:w-96"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Bot className="size-4" />
              </span>
              <div className="leading-tight">
                <p className="font-heading text-sm text-foreground">BarberBot</p>
                <p className="text-xs text-muted-foreground">{shopName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </header>

          <div
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-2 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-gold-gradient text-primary-foreground"
                      : m.isError
                        ? "border border-destructive/40 bg-destructive/10 text-destructive"
                        : "border border-border bg-background/60 text-foreground"
                  }`}
                >
                  {m.text}
                </p>

                {m.proposal && (
                  <div className="w-full max-w-[90%] rounded-xl border border-gold/40 bg-gold/5 p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
                      <CalendarCheck className="size-4" />
                      Tu reserva
                    </p>
                    <dl className="space-y-1.5 text-sm">
                      {[
                        ["Servicio", m.proposal.serviceName],
                        ["Barbero", m.proposal.barberName],
                        ["Fecha", formatDateKey(m.proposal.date)],
                        ["Hora", m.proposal.time],
                        ["Total", formatCOP(m.proposal.price)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="text-right capitalize text-foreground">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {m.cardError && (
                      <p role="alert" className="mt-3 text-sm text-destructive">
                        {m.cardError}
                      </p>
                    )}

                    <div className="mt-4">
                      {m.status === "done" ? (
                        <p className="text-sm text-gold-light">
                          ✓ Reserva creada
                        </p>
                      ) : m.status === "replaced" ? (
                        <p className="text-sm text-muted-foreground">
                          Esta propuesta ya no está vigente.
                        </p>
                      ) : !hydrated ? null : !user ? (
                        <Button
                          asChild
                          size="sm"
                          className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                        >
                          <Link href="/login">Inicia sesión para reservar</Link>
                        </Button>
                      ) : !canBook ? (
                        <p className="text-sm text-muted-foreground">
                          Las reservas son solo para cuentas de cliente.
                        </p>
                      ) : (
                        <Button
                          size="sm"
                          disabled={m.status === "saving"}
                          onClick={() => confirm(m)}
                          className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                        >
                          {m.status === "saving"
                            ? "Reservando…"
                            : "Confirmar reserva"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <p className="w-fit rounded-2xl border border-border bg-background/60 px-3.5 py-2 text-sm text-muted-foreground">
                Escribiendo…
              </p>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Escribe tu mensaje…"
              aria-label="Mensaje para BarberBot"
              className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="bg-gold-gradient text-primary-foreground hover:opacity-90"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar BarberBot" : "Abrir BarberBot"}
        className="fixed bottom-5 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-gold-gradient text-primary-foreground shadow-xl transition-transform hover:scale-105 sm:right-6"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>
    </>
  );
}