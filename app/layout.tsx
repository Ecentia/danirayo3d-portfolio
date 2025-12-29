import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // 1. Importamos desde Google
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import AdminControls from "@/components/AdminControls";

// 2. Configuramos las fuentes para que se descarguen solas
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DaniRayo3D Portfolio",
  description: "3D Artist & Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // 3. Aplicamos las variables CSS
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <AdminProvider>
          {children}
          <AdminControls />
        </AdminProvider>
      </body>
    </html>
  );
}