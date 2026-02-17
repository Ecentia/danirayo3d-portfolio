import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "Daniel Rayo | 3D Artist & Developer",
  description: "Portfolio profesional de Daniel Rayo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} ${orbitron.variable} antialiased bg-[#050505]`}>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}