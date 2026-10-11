import type { Barberia } from "@/lib/types";

export const barberias: Barberia[] = [
  {
    slug: "the-gentlemans-cut",
    nombre: "The Gentleman's Cut",
    barrio: "Cabecera",
    ciudad: "Bucaramanga",
    descripcion: "Barbería clásica con ambiente elegante, especialistas en cortes a tijera y afeitado con toalla caliente.",
    calificacion: 4.9,
    resenas: 212,
    horario: "Lun a Sáb · 9:00 a.m. – 8:00 p.m.",
    servicios: [
      { id: "s1", nombre: "Corte clásico", precio: 35000, duracionMin: 40 },
      { id: "s2", nombre: "Corte + barba", precio: 55000, duracionMin: 60 },
      { id: "s3", nombre: "Afeitado con toalla caliente", precio: 30000, duracionMin: 30 },
    ],
    barberos: [
      { id: "b1", nombre: "Santiago Rueda", especialidad: "Corte a tijera" },
      { id: "b2", nombre: "Camilo Ortiz", especialidad: "Barba y perfilado" },
    ],
  },
  {
    slug: "black-gold-barber",
    nombre: "Black & Gold Barber",
    barrio: "Cañaveral",
    ciudad: "Floridablanca",
    descripcion: "Estilo moderno, fades perfectos y diseños. Reserva fácil y atención puntual.",
    calificacion: 4.8,
    resenas: 164,
    horario: "Lun a Dom · 10:00 a.m. – 9:00 p.m.",
    servicios: [
      { id: "s1", nombre: "Fade", precio: 30000, duracionMin: 35 },
      { id: "s2", nombre: "Corte + diseño", precio: 40000, duracionMin: 50 },
      { id: "s3", nombre: "Cejas y perfilado", precio: 15000, duracionMin: 15 },
    ],
    barberos: [
      { id: "b1", nombre: "Julián Mejía", especialidad: "Fades" },
      { id: "b2", nombre: "Andrés Pabón", especialidad: "Diseños" },
      { id: "b3", nombre: "Mateo Villamizar", especialidad: "Corte clásico" },
    ],
  },
  {
    slug: "la-navaja-dorada",
    nombre: "La Navaja Dorada",
    barrio: "San Francisco",
    ciudad: "Bucaramanga",
    descripcion: "Tradición y buen trato. Ideal para barba, cortes ejecutivos y cuidado personal.",
    calificacion: 4.6,
    resenas: 98,
    horario: "Lun a Sáb · 8:30 a.m. – 7:00 p.m.",
    servicios: [
      { id: "s1", nombre: "Corte ejecutivo", precio: 28000, duracionMin: 35 },
      { id: "s2", nombre: "Barba completa", precio: 25000, duracionMin: 30 },
    ],
    barberos: [{ id: "b1", nombre: "Don Ricardo Parra", especialidad: "Corte ejecutivo" }],
  },
  {
    slug: "kings-barbershop",
    nombre: "Kings Barbershop",
    barrio: "Ruitoque",
    ciudad: "Floridablanca",
    descripcion: "Experiencia premium: corte, barba, mascarilla y bebida de cortesía.",
    calificacion: 4.7,
    resenas: 131,
    horario: "Mar a Dom · 11:00 a.m. – 9:00 p.m.",
    servicios: [
      { id: "s1", nombre: "Experiencia Kings", precio: 80000, duracionMin: 90 },
      { id: "s2", nombre: "Corte premium", precio: 45000, duracionMin: 45 },
      { id: "s3", nombre: "Mascarilla facial", precio: 20000, duracionMin: 20 },
    ],
    barberos: [
      { id: "b1", nombre: "Esteban Cárdenas", especialidad: "Experiencia premium" },
      { id: "b2", nombre: "Felipe Duarte", especialidad: "Barba" },
    ],
  },
];

export function getBarberia(slug: string) {
  return barberias.find((b) => b.slug === slug);
}

export function precioDesde(b: Barberia) {
  return Math.min(...b.servicios.map((s) => s.precio));
}

export function formatoCOP(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}