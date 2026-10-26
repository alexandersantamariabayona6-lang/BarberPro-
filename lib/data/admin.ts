import { supabase } from "@/lib/supabase/client";
import type { ShopService } from "@/lib/types";

type ServiceRow = {
  id: string;
  barbershop_id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
};

function toService(r: ServiceRow): ShopService {
  return {
    id: r.id,
    barbershopId: r.barbershop_id,
    name: r.name,
    description: r.description,
    price: r.price,
    duration: r.duration_min,
  };
}

export type ServiceInput = {
  name: string;
  description: string;
  price: number;
  duration: number;
};

export async function getAdminServices(shopId: string): Promise<ShopService[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, barbershop_id, name, description, price, duration_min")
    .eq("barbershop_id", shopId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data as ServiceRow[]).map(toService);
}

export async function saveService(
  shopId: string,
  input: ServiceInput,
  id?: string
): Promise<void> {
  const values = {
    name: input.name,
    description: input.description,
    price: input.price,
    duration_min: input.duration,
  };
  const { error } = id
    ? await supabase.from("services").update(values).eq("id", id)
    : await supabase
        .from("services")
        .insert({ ...values, barbershop_id: shopId });
  if (error) throw new Error(error.message);
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "No puedes eliminar este servicio porque tiene citas asociadas."
      );
    }
    throw new Error(error.message);
  }
}

export async function getShopCounts(shopId: string) {
  const [services, barbers, appointments] = await Promise.all([
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("barbershop_id", shopId),
    supabase
      .from("barbers")
      .select("id", { count: "exact", head: true })
      .eq("barbershop_id", shopId),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("barbershop_id", shopId)
      .neq("status", "cancelada"),
  ]);

  const failed = services.error ?? barbers.error ?? appointments.error;
  if (failed) throw new Error(failed.message);

  return {
    services: services.count ?? 0,
    barbers: barbers.count ?? 0,
    appointments: appointments.count ?? 0,
  };
}

export async function createBarbershop(input: {
  name: string;
  city: string;
  address: string;
  description: string;
  openHours: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_barbershop", {
    p_name: input.name,
    p_city: input.city,
    p_address: input.address,
    p_description: input.description,
    p_open_hours: input.openHours,
  });
  if (error) throw new Error(error.message);
  return data as string;
}