export type Role = "cliente" | "barbero" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  barbershopId?: string; // solo barbero y admin
};

export type Barbershop = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  description: string;
  rating: number;
  openHours: string;
};

export type ShopService = {
  id: string;
  barbershopId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutos
};

export type ShopBarber = {
  id: string;
  userId: string;
  barbershopId: string;
  name: string;
  specialty: string;
  rating: number;
};

export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada";

export type Appointment = {
  id: string;
  barbershopId: string;
  barberId: string;
  serviceId: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
};