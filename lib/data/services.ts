export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutos
  icon: "scissors" | "beard" | "combo" | "razor";
};

export const services: Service[] = [
  {
    id: "corte-clasico",
    name: "Corte clásico",
    description: "Corte a tijera o máquina, lavado y peinado final.",
    price: 35000,
    duration: 40,
    icon: "scissors",
  },
  {
    id: "barba",
    name: "Arreglo de barba",
    description: "Perfilado con navaja, toalla caliente y aceites.",
    price: 25000,
    duration: 30,
    icon: "beard",
  },
  {
    id: "combo-premium",
    name: "Combo premium",
    description: "Corte + barba + mascarilla facial. La experiencia completa.",
    price: 55000,
    duration: 75,
    icon: "combo",
  },
  {
    id: "afeitado",
    name: "Afeitado tradicional",
    description: "Afeitado con navaja y toalla caliente, como antes.",
    price: 30000,
    duration: 35,
    icon: "razor",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);