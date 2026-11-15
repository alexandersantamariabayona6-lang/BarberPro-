import { supabase } from "@/lib/supabase/client";

const BUCKET = "photos";
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const TYPES = ["image/jpeg", "image/png", "image/webp"];

function validate(file: File) {
  if (!TYPES.includes(file.type)) {
    throw new Error("La foto debe ser JPG, PNG o WebP.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("La foto no puede pesar más de 2 MB.");
  }
}

// Sube el archivo y devuelve su dirección pública.
// La ruta es fija, así que una foto nueva reemplaza a la anterior.
async function upload(path: string, file: File): Promise<string> {
  validate(file);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(`No pudimos subir la foto: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // El ?v= evita que el navegador muestre la foto vieja guardada en caché
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function uploadShopPhoto(
  shopId: string,
  file: File
): Promise<string> {
  const url = await upload(`${shopId}/shop`, file);
  const { data, error } = await supabase
    .from("barbershops")
    .update({ image_url: url })
    .eq("id", shopId)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("No pudimos guardar la foto de la barbería.");
  }
  return url;
}

export async function uploadBarberPhoto(
  shopId: string,
  barberId: string,
  file: File
): Promise<string> {
  const url = await upload(`${shopId}/barber-${barberId}`, file);
  const { data, error } = await supabase
    .from("barbers")
    .update({ image_url: url })
    .eq("id", barberId)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("No pudimos guardar la foto del barbero.");
  }
  return url;
}

export async function getShopPhoto(shopId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("barbershops")
    .select("image_url")
    .eq("id", shopId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.image_url as string | null) ?? null;
}