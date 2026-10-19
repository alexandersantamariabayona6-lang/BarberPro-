import { supabase } from "@/lib/supabase/client";

export type AppointmentStatus = "pendiente" | "confirmada" | "cancelada";

export type AppointmentView = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  serviceName: string;
  price: number;
  duration: number;
  shopName: string;
  shopAddress: string;
  barberName: string;
  clientName: string;
};

export type BusySlot = { time: string; duration: number };

type Row = {
  id: string;
  appt_date: string;
  appt_time: string;
  status: AppointmentStatus;
  services: { name: string; price: number; duration_min: number } | null;
  barbers: { name: string } | null;
  barbershops: { name: string; address: string } | null;
  client: { full_name: string } | null;
};

const APPOINTMENT_SELECT = `
  id, appt_date, appt_time, status,
  services (name, price, duration_min),
  barbers (name),
  barbershops (name, address),
  client:profiles!client_id (full_name)
`;

function toView(row: Row): AppointmentView {
  return {
    id: row.id,
    date: row.appt_date,
    time: row.appt_time.slice(0, 5),
    status: row.status,
    serviceName: row.services?.name ?? "Servicio",
    price: row.services?.price ?? 0,
    duration: row.services?.duration_min ?? 0,
    shopName: row.barbershops?.name ?? "",
    shopAddress: row.barbershops?.address ?? "",
    barberName: row.barbers?.name ?? "",
    clientName: row.client?.full_name ?? "",
  };
}

export async function getBusySlots(
  barberId: string,
  date: string
): Promise<BusySlot[]> {
  const { data, error } = await supabase.rpc("busy_slots", {
    p_barber: barberId,
    p_date: date,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as { start_time: string; duration_min: number }[]).map(
    (r) => ({ time: r.start_time.slice(0, 5), duration: r.duration_min })
  );
}

export async function createAppointment(input: {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_appointment", {
    p_service: input.serviceId,
    p_barber: input.barberId,
    p_date: input.date,
    p_time: input.time,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function cancelAppointment(id: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_appointment", { p_id: id });
  if (error) throw new Error(error.message);
}

// Citas del cliente que inició sesión (la base de datos solo le entrega las suyas)
export async function getMyAppointments(): Promise<AppointmentView[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .order("appt_date", { ascending: false })
    .order("appt_time", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as Row[]).map(toView);
}

// Agenda del barbero: citas desde una fecha, sin las canceladas
export async function getBarberAgenda(
  fromDate: string
): Promise<AppointmentView[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .gte("appt_date", fromDate)
    .neq("status", "cancelada")
    .order("appt_date", { ascending: true })
    .order("appt_time", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as Row[]).map(toView);
}