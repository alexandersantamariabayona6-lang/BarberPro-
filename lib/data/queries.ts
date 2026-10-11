import { barbers, barbershops, services } from "@/lib/data/mock";

export function getBarbershops() {
  return barbershops;
}

export function getBarbershopBySlug(slug: string) {
  return barbershops.find((s) => s.slug === slug);
}

export function getServicesByShop(shopId: string) {
  return services.filter((s) => s.barbershopId === shopId);
}

export function getBarbersByShop(shopId: string) {
  return barbers.filter((b) => b.barbershopId === shopId);
}

export function getMinPrice(shopId: string) {
  const list = getServicesByShop(shopId);
  return list.length ? Math.min(...list.map((s) => s.price)) : null;
}