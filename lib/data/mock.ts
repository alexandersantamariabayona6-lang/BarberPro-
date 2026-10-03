import type {
  Appointment,
  Barbershop,
  ShopBarber,
  ShopService,
  User,
} from "@/lib/types";

export const barbershops: Barbershop[] = [
  {
    id: "shop-1",
    slug: "golden-blade",
    name: "Golden Blade",
    city: "Bucaramanga",
    address: "Cra. 27 #36-20",
    description: "Barbería clásica con ambiente de club privado.",
    rating: 4.9,
    openHours: "Lun–Sáb · 9:00 a 19:00",
  },
  {
    id: "shop-2",
    slug: "the-gentlemans-cut",
    name: "The Gentleman's Cut",
    city: "Medellín",
    address: "Cl. 10 #40-15",
    description: "Cortes modernos y afeitado tradicional.",
    rating: 4.7,
    openHours: "Lun–Dom · 10:00 a 20:00",
  },
];

// Contraseña de todas las cuentas de prueba: demo123
export const users: User[] = [
  { id: "u-cliente-1", name: "Laura Martínez", email: "laura@demo.com", role: "cliente" },
  { id: "u-barbero-1", name: "Andrés Rojas", email: "andres@demo.com", role: "barbero", barbershopId: "shop-1" },
  { id: "u-barbero-2", name: "Camilo Pérez", email: "camilo@demo.com", role: "barbero", barbershopId: "shop-1" },
  { id: "u-barbero-3", name: "Sebastián Gómez", email: "sebastian@demo.com", role: "barbero", barbershopId: "shop-2" },
  { id: "u-admin-1", name: "Carlos Duarte", email: "carlos@demo.com", role: "admin", barbershopId: "shop-1" },
  { id: "u-admin-2", name: "Marta Ríos", email: "marta@demo.com", role: "admin", barbershopId: "shop-2" },
];

export const services: ShopService[] = [
  { id: "sv-1", barbershopId: "shop-1", name: "Corte clásico", description: "Corte a tijera o máquina, lavado y peinado.", price: 35000, duration: 40 },
  { id: "sv-2", barbershopId: "shop-1", name: "Arreglo de barba", description: "Perfilado con navaja y toalla caliente.", price: 25000, duration: 30 },
  { id: "sv-3", barbershopId: "shop-1", name: "Combo premium", description: "Corte + barba + mascarilla facial.", price: 55000, duration: 75 },
  { id: "sv-4", barbershopId: "shop-2", name: "Corte moderno", description: "Fade, diseños y acabado con producto.", price: 40000, duration: 45 },
  { id: "sv-5", barbershopId: "shop-2", name: "Afeitado tradicional", description: "Afeitado con navaja y toalla caliente.", price: 30000, duration: 35 },
];

export const barbers: ShopBarber[] = [
  { id: "b-1", userId: "u-barbero-1", barbershopId: "shop-1", name: "Andrés Rojas", specialty: "Cortes clásicos y fade", rating: 4.9 },
  { id: "b-2", userId: "u-barbero-2", barbershopId: "shop-1", name: "Camilo Pérez", specialty: "Barba y afeitado a navaja", rating: 4.8 },
  { id: "b-3", userId: "u-barbero-3", barbershopId: "shop-2", name: "Sebastián Gómez", specialty: "Estilos modernos y diseños", rating: 4.9 },
];

export const appointments: Appointment[] = [
  { id: "a-1", barbershopId: "shop-1", barberId: "b-1", serviceId: "sv-1", clientId: "u-cliente-1", date: "2026-10-05", time: "10:00", status: "confirmada" },
  { id: "a-2", barbershopId: "shop-1", barberId: "b-1", serviceId: "sv-3", clientId: "u-cliente-1", date: "2026-10-05", time: "15:30", status: "pendiente" },
  { id: "a-3", barbershopId: "shop-1", barberId: "b-2", serviceId: "sv-2", clientId: "u-cliente-1", date: "2026-10-06", time: "11:00", status: "confirmada" },
  { id: "a-4", barbershopId: "shop-2", barberId: "b-3", serviceId: "sv-4", clientId: "u-cliente-1", date: "2026-10-07", time: "16:00", status: "pendiente" },
];