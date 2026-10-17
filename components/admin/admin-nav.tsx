"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/servicios", label: "Servicios" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-2 overflow-x-auto border-b border-border pb-3">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-colors ${
              active
                ? "bg-gold/10 text-gold-light"
                : "text-muted-foreground hover:text-gold-light"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}