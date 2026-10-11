import type { ReactNode } from "react";
import Navbar from "@/components/layout/navbar";

export default function BarberiasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
    </>
  );
}