"use client";

import NavBar from "@/components/sections/NavBar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <NavBar />
      <main className="flex-1 pt-24 md:pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
}
