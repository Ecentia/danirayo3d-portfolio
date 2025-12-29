import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700", "900"],
  variable: '--font-orbitron'
});

export const metadata: Metadata = {
  title: "Daniel Rayo | 3D Portfolio",
  description: "Portfolio inmersivo de Daniel Rayo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        {/* ENVUELVE TODO AQUÍ */}
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}