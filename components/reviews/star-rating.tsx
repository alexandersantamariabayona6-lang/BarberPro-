"use client";

import { Star } from "lucide-react";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  label?: string;
};

export default function StarRating({
  value,
  onChange,
  size = "md",
  label = "Calificación",
}: Props) {
  const px = size === "sm" ? "size-4" : "size-7";
  const interactive = Boolean(onChange);

  return (
    <div
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? label : `${label}: ${value} de 5`}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <Star
            className={`${px} ${
              filled ? "fill-gold text-gold" : "text-muted-foreground"
            }`}
          />
        );

        if (!interactive) return <span key={n}>{star}</span>;

        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onChange?.(n)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}