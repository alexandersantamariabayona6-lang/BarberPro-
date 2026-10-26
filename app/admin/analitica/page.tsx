"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import RoleGuard from "@/components/auth/role-guard";
import AdminNav from "@/components/admin/admin-nav";
import DashboardShell from "@/components/layout/dashboard-shell";
import { toDateKey } from "@/lib/booking";
import {
  getShopAppointments,
  type AppointmentView,
} from "@/lib/data/appointments";
import { formatCOP } from "@/lib/format";

type Range = 7 | 14 | 30;
type Slice = { name: string; value: number };

const PALETTE = ["#d4af37", "#f3dc8a", "#9c7a1a", "#c9c9c9", "#6b6b6b", "#e7c766"];

const tooltipStyle = {
  background: "#111111",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  color: "#f5f5f5",
};

const chipBase = "rounded-full border px-4 py-1.5 text-sm transition-colors";
const chipOn = "border-gold bg-gold/10 text-gold-light";
const chipOff =
  "border-border text-muted-foreground hover:border-gold/50 hover:text-gold-light";

const dayLabel = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
});

function startsAt(a: AppointmentView) {
  const [y, m, d] = a.date.split("-").map(Number);
  const [h, min] = a.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

function sumBy<T>(
  items: T[],
  key: (item: T) => string,
  value: (item: T) => number
): Slice[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + value(item));
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-heading text-2xl text-gold-light sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PieCard({
  title,
  subtitle,
  data,
  money,
}: {
  title: string;
  subtitle: string;
  data: Slice[];
  money?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const show = (v: number) => (money ? formatCOP(v) : String(v));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-heading text-lg text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sin datos en este período.
        </p>
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((d, i) => (
                    <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#f5f5f5" }}
                  formatter={(v) => show(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-3 space-y-1.5 text-sm">
            {data.map((d, i) => (
              <li
                key={d.name}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="truncate text-muted-foreground">
                    {d.name}
                  </span>
                </span>
                <span className="shrink-0 text-foreground">
                  {show(d.value)}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({Math.round((d.value / total) * 100)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function AnalyticsContent() {
  const [items, setItems] = useState<AppointmentView[] | null>(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState<Range>(14);

  useEffect(() => {
    let active = true;
    getShopAppointments()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = toDateKey(now);

    // Realizadas = confirmadas cuya hora ya pasó
    const done = (items ?? []).filter(
      (a) => a.status === "confirmada" && startsAt(a) <= now
    );

    const days: { key: string; label: string }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        key: toDateKey(d),
        label: dayLabel.format(d).replace(".", ""),
      });
    }

    const inRange = done.filter((a) => a.date >= days[0].key);
    const daily = days.map((d) => {
      const dayItems = inRange.filter((a) => a.date === d.key);
      return {
        dia: d.label,
        ganancias: dayItems.reduce((sum, a) => sum + a.price, 0),
        cortes: dayItems.length,
      };
    });

    const today = done.filter((a) => a.date === todayKey);
    const revenue = inRange.reduce((sum, a) => sum + a.price, 0);
    const bestDay = daily.reduce(
      (best, d) => (d.ganancias > best.ganancias ? d : best),
      daily[0]
    );

    return {
      todayRevenue: today.reduce((sum, a) => sum + a.price, 0),
      revenue,
      count: inRange.length,
      average: inRange.length ? Math.round(revenue / inRange.length) : 0,
      daily,
      bestDay: bestDay && bestDay.ganancias > 0 ? bestDay : null,
      byService: sumBy(inRange, (a) => a.serviceName, () => 1),
      byBarber: sumBy(inRange, (a) => a.barberName || "Otro", (a) => a.price),
    };
  }, [items, range]);

  return (
    <DashboardShell
      title="Analítica"
      subtitle="Ganancias, servicios y rendimiento de tu barbería."
    >
      <AdminNav />

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {([7, 14, 30] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`${chipBase} ${range === r ? chipOn : chipOff}`}
          >
            Últimos {r} días
          </button>
        ))}
      </div>

      {items === null && !error ? (
        <p className="text-muted-foreground">Cargando analítica…</p>
      ) : stats.count === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Todavía no hay servicios realizados en este período.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Indicadores */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Ganancias de hoy"
              value={formatCOP(stats.todayRevenue)}
            />
            <KpiCard
              label={`Ganancias (${range} días)`}
              value={formatCOP(stats.revenue)}
            />
            <KpiCard label="Servicios realizados" value={String(stats.count)} />
            <KpiCard label="Ticket promedio" value={formatCOP(stats.average)} />
          </div>

          {/* Lo más relevante */}
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
            <h3 className="font-heading text-lg text-gold-light">
              Lo más relevante
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {stats.bestDay && (
                <li>
                  Tu mejor día fue el{" "}
                  <span className="text-foreground">{stats.bestDay.dia}</span>,
                  con {formatCOP(stats.bestDay.ganancias)} en{" "}
                  {stats.bestDay.cortes} servicios.
                </li>
              )}
              {stats.byService[0] && (
                <li>
                  El servicio estrella es{" "}
                  <span className="text-foreground">
                    {stats.byService[0].name}
                  </span>{" "}
                  ({stats.byService[0].value} veces).
                </li>
              )}
              {stats.byBarber[0] && (
                <li>
                  <span className="text-foreground">
                    {stats.byBarber[0].name}
                  </span>{" "}
                  es quien más ingresos generó:{" "}
                  {formatCOP(stats.byBarber[0].value)}.
                </li>
              )}
            </ul>
          </div>

          {/* Ganancias por día */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-heading text-lg text-foreground">
              Ganancias por día
            </h3>
            <p className="text-xs text-muted-foreground">
              Servicios realizados en los últimos {range} días
            </p>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.daily}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2a2a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dia"
                    tick={{ fill: "#9a9a9a", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={16}
                  />
                  <YAxis
                    tick={{ fill: "#9a9a9a", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#f5f5f5" }}
                    labelStyle={{ color: "#d4af37" }}
                    cursor={{ fill: "rgba(212,175,55,0.08)" }}
                    formatter={(v) => [formatCOP(Number(v)), "Ganancias"]}
                  />
                  <Bar
                    dataKey="ganancias"
                    fill="#d4af37"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pasteles */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PieCard
              title="Servicios más realizados"
              subtitle="Cantidad de cortes y servicios por tipo"
              data={stats.byService}
            />
            <PieCard
              title="Ganancias por barbero"
              subtitle="Ingresos generados por cada integrante"
              data={stats.byBarber}
              money
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <AnalyticsContent />
    </RoleGuard>
  );
}