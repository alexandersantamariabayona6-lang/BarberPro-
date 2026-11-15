"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createReview } from "@/lib/data/reviews";
import StarRating from "./star-rating";

type Props = {
  appointmentId: string;
  shopName: string;
  barberName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
};

export default function ReviewDialog({
  appointmentId,
  shopName,
  barberName,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const [shopRating, setShopRating] = useState(0);
  const [barberRating, setBarberRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (shopRating === 0) {
      setError("Elige cuántas estrellas le das a la barbería.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createReview({
        appointmentId,
        shopRating,
        barberRating: barberRating > 0 ? barberRating : null,
        comment: comment.trim(),
      });
      onOpenChange(false);
      onDone();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos guardar tu reseña."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Deja tu reseña
          </DialogTitle>
          <DialogDescription>
            Cuéntanos cómo te fue en {shopName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>La barbería</Label>
            <StarRating
              value={shopRating}
              onChange={setShopRating}
              label="Calificación de la barbería"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Tu barbero, {barberName}{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <StarRating
              value={barberRating}
              onChange={setBarberRating}
              label="Calificación del barbero"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">
              Comentario{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="¿Qué tal el corte y la atención?"
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            />
            <p className="text-right text-xs text-muted-foreground">
              {comment.length}/500
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              {saving ? "Enviando..." : "Publicar reseña"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}