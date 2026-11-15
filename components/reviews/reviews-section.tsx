import { MessageSquareText } from "lucide-react";
import { getShopReviews } from "@/lib/data/reviews";
import StarRating from "./star-rating";

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function ReviewsSection({ shopId }: { shopId: string }) {
  const reviews = await getShopReviews(shopId);
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.shopRating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl">
          <span className="text-gold-gradient">Reseñas</span> de clientes
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarRating value={average} size="sm" label="Promedio" />
            <span className="text-gold-light">{average.toFixed(1)}</span>
            <span>
              · {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
          <MessageSquareText className="size-7 text-gold" />
          <p className="text-muted-foreground">
            Todavía no hay reseñas. Sé el primero en dejar una después de tu
            cita.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-foreground">{r.authorName}</p>
                <span className="text-xs text-muted-foreground">
                  {dateFormat.format(new Date(r.createdAt))}
                </span>
              </div>
              <div className="mt-2">
                <StarRating value={r.shopRating} size="sm" label="Barbería" />
              </div>
              {r.comment && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {r.comment}
                </p>
              )}
                {r.barberName && r.barberRating && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Barbero {r.barberName}:</span>
                    <StarRating
                        value={r.barberRating}
                        size="sm"
                        label={`Barbero ${r.barberName}`}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )} 
    </section>
  );
}