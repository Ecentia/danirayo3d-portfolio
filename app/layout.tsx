import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import AdminControls from "@/components/AdminControls";

// Componentes SOLO de Escritorio (Layout Global)
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WelcomeScreen from "@/components/layout/WelcomeScreen";

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
  icons: {
    icon: "/favicon.ico",
  },
};

// Configuración de Viewport para que se sienta como App Nativa (sin zoom)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-red-500/30 overflow-x-hidden`}
      >
        <AdminProvider>
          {/* Pantalla de carga inicial (opcional, compartida) */}
          <WelcomeScreen />

          {/* --- ELEMENTOS DE ESCRITORIO --- */}
          {/* Se ocultan en móvil (hidden) y se muestran en desktop (md:block) */}
          <div className="hidden md:block">
            <Header />
          </div>

          {/* --- CONTENIDO PRINCIPAL --- */}
          {/* En móvil, el MobileShell ocupará toda la pantalla (fixed). 
              En escritorio, esto renderiza la web normal. */}
          {children}

          {/* --- FOOTER DE ESCRITORIO --- */}
          <div className="hidden md:block">
            <Footer />
          </div>
          
          {/* Controles de Admin (flotantes, siempre útiles) */}
          <AdminControls />
        </AdminProvider>
      </body>
    </html>
  );
}