import type { BusySlot } from "@/lib/data/appointments";
import type { Barbershop, ShopService } from "@/lib/types";

const STEP_MIN = 30;

export function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTime(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// Lee "Lun–Sáb · 9:00 a 19:00" y devuelve apertura y cierre en minutos
function parseHours(openHours: string) {
  const match = openHours.match(/(\d{1,2}):(\d{2})\s*a\s*(\d{1,2}):(\d{2})/);
  if (!match) return { open: 9 * 60, close: 19 * 60 };
  return {
    open: Number(match[1]) * 60 + Number(match[2]),
    close: Number(match[3]) * 60 + Number(match[4]),
  };
}

// Próximos días en que abre la barbería (si el horario no dice "Dom", no abre domingos)
export function getAvailableDays(shop: Barbershop, count = 7) {
  const opensSundays = shop.openHours.includes("Dom");
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.length < count) {
    if (cursor.getDay() !== 0 || opensSundays) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getAvailableSlots(
  shop: Barbershop,
  service: ShopService,
  date: Date,
  busy: BusySlot[]
) {
  const { open, close } = parseHours(shop.openHours);
  const key = toDateKey(date);
  const now = new Date();
  const isToday = key === toDateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const busyRanges = busy.map((b) => {
    const start = toMinutes(b.time);
    return { start, end: start + b.duration };
  });

  const slots: string[] = [];
  for (let start = open; start + service.duration <= close; start += STEP_MIN) {
    if (isToday && start <= nowMin) continue;
    const end = start + service.duration;
    const overlaps = busyRanges.some((b) => start < b.end && end > b.start);
    if (!overlaps) slots.push(toTime(start));
  }
  return slots;
}