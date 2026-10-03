export type Barber = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  rating: number;
  years: number;
};

export const barbers: Barber[] = [
  {
    id: "andres",
    name: "Andrés Rojas",
    role: "Master barber",
    specialty: "Cortes clásicos y fade",
    rating: 4.9,
    years: 8,
  },
  {
    id: "camilo",
    name: "Camilo Pérez",
    role: "Barbero senior",
    specialty: "Barba y afeitado a navaja",
    rating: 4.8,
    years: 6,
  },
  {
    id: "sebastian",
    name: "Sebastián Gómez",
    role: "Barbero",
    specialty: "Estilos modernos y diseños",
    rating: 4.9,
    years: 4,
  },
];