import type { Metadata } from "next";
import { AdminProvider } from "@/context/AdminContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel Rayo | Lego Developer World",
  description: "Senior Product Designer & Developer Portfolio - Interactive Lego Experience",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* Añadimos 'suppressHydrationWarning' al body para que Next.js ignore 
        los cambios que hacen tus extensiones del navegador (como cz-shortcut-listen)
        y no lance el error de "Hydration Mismatch".
      */}
      <body 
        className="antialiased overflow-hidden select-none bg-[#1a1a1a] text-white"
        suppressHydrationWarning
      >
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}