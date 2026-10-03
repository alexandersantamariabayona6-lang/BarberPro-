import Navbar from "@/components/layout/navbar";
import Hero from "@/components/landing/hero";
import Services from "@/components/landing/services";
import Barbers from "@/components/landing/barbers";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Barbers />
      </main>
    </>
  );
}