import { supabasePublic } from "@/lib/supabase/public";
import type { Barbershop, ShopBarber, ShopService } from "@/lib/types";

export type ShopWithDetails = Barbershop & {
  services: ShopService[];
  barbers: ShopBarber[];
};

type ShopRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  description: string;
  open_hours: string;
  rating: number;
  services: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_min: number;
  }[];
  barbers: {
    id: string;
    profile_id: string;
    name: string;
    specialty: string;
    rating: number;
  }[];
};

const SHOP_SELECT = `
  id, slug, name, city, address, description, open_hours, rating,
  services (id, name, description, price, duration_min),
  barbers (id, profile_id, name, specialty, rating)
`;

// Convierte la fila de la base de datos al formato que usa la app
function toShop(row: ShopRow): ShopWithDetails {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    address: row.address,
    description: row.description,
    rating: Number(row.rating),
    openHours: row.open_hours,
    services: row.services
      .map((s) => ({
        id: s.id,
        barbershopId: row.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration_min,
      }))
      .sort((a, b) => a.price - b.price),
    barbers: row.barbers.map((b) => ({
      id: b.id,
      userId: b.profile_id,
      barbershopId: row.id,
      name: b.name,
      specialty: b.specialty,
      rating: Number(b.rating),
    })),
  };
}

export async function getDirectory(): Promise<ShopWithDetails[]> {
  const { data, error } = await supabasePublic
    .from("barbershops")
    .select(SHOP_SELECT)
    .order("name");

  if (error) {
    throw new Error(`No se pudieron cargar las barberías: ${error.message}`);
  }
  return (data as unknown as ShopRow[]).map(toShop);
}

export async function getShopBySlug(
  slug: string
): Promise<ShopWithDetails | null> {
  const { data, error } = await supabasePublic
    .from("barbershops")
    .select(SHOP_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la barbería: ${error.message}`);
  }
  return data ? toShop(data as unknown as ShopRow) : null;
}