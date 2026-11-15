import { supabase } from "@/lib/supabase/client";
import { supabasePublic } from "@/lib/supabase/public";

export type ReviewView = {
  id: string;
  authorName: string;
  shopRating: number;
  barberRating: number | null;
  barberName: string | null;
  comment: string;
  createdAt: string;
};

type Row = {
  id: string;
  author_name: string;
  shop_rating: number;
  barber_rating: number | null;
  comment: string;
  created_at: string;
  barbers: { name: string } | null;
};

// Reseñas públicas de una barbería (las más recientes primero)
export async function getShopReviews(shopId: string): Promise<ReviewView[]> {
  const { data, error } = await supabasePublic
    .from("reviews")
    .select(
      "id, author_name, shop_rating, barber_rating, comment, created_at, barbers (name)"
    )
    .eq("barbershop_id", shopId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar las reseñas: ${error.message}`);

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    authorName: r.author_name,
    shopRating: r.shop_rating,
    barberRating: r.barber_rating,
    barberName: r.barbers?.name ?? null,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

// De estas citas, cuáles ya tienen reseña (para ocultar el botón)
export async function getReviewedAppointmentIds(
  appointmentIds: string[]
): Promise<Set<string>> {
  if (appointmentIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from("reviews")
    .select("appointment_id")
    .in("appointment_id", appointmentIds);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.appointment_id as string));
}

export async function createReview(input: {
  appointmentId: string;
  shopRating: number;
  barberRating: number | null;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.rpc("create_review", {
    p_appointment: input.appointmentId,
    p_shop_rating: input.shopRating,
    p_barber_rating: input.barberRating,
    p_comment: input.comment,
  });
  if (error) throw new Error(error.message);
}