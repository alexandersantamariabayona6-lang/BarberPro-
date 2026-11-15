"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  imageUrl?: string | null;
  initial: string; // letra que se ve cuando aún no hay foto
  onUpload: (file: File) => Promise<string>;
  onUploaded?: (url: string) => void;
  shape?: "square" | "round";
};

export default function PhotoUpload({
  imageUrl,
  initial,
  onUpload,
  onUploaded,
  shape = "square",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const box =
    shape === "round"
      ? "size-24 rounded-full"
      : "h-44 w-full max-w-sm rounded-xl";

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const newUrl = await onUpload(file);
      setUrl(newUrl);
      onUploaded?.(newUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-center overflow-hidden border border-gold/30 bg-gradient-to-br from-zinc-900 via-zinc-800 to-gold/20 ${box}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-heading text-4xl text-gold-gradient">
            {initial}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="border-gold/40 text-gold-light hover:bg-accent hover:text-gold-light"
      >
        <Camera className="mr-1 size-4" />
        {uploading ? "Subiendo..." : url ? "Cambiar foto" : "Subir foto"}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}