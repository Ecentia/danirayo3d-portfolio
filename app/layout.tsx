import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import { UiProvider } from "@/context/UiContext";
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

// --- CONFIGURACIÓN SEO MAESTRA (VERSIÓN GAME DEV) ---
export const metadata: Metadata = {
  metadataBase: new URL("https://danirayo3d.es"),
  
  title: {
    default: "DaniRayo3D | Daniel Rayo - Artista 3D & Game Developer",
    template: "%s | DaniRayo3D Portfolio",
  },
  
  description: "Portfolio oficial de Daniel Rayo (DaniRayo3D / Malegro 32). Game Developer y Artista 3D especializado en entornos, personajes y experiencias interactivas.",
  
  // Palabras clave corregidas: Solo Game Dev y 3D
  keywords: [
    // Identidad
    "Daniel Rayo", 
    "Dani Rayo", 
    "DaniRayo3D", 
    "Malegro 32", 
    "Malegro 3D", 
    "Dani 3D", 
    "Daniel 3D",
    
    // Profesión & Rol
    "Game Developer",
    "Desarrollador de Videojuegos",
    "3D Artist", 
    "Artista 3D", 
    "Environment Artist",
    "3D Generalist",
    
    // Software / Skills (Enfocados a 3D/Juegos)
    "Blender", 
    "Unreal Engine",
    "Unity",
    "3D Modeling",
    "Texturing",
    "Level Design"
  ],
  
  authors: [{ name: "Daniel Rayo", url: "https://danirayo3d.es" }],
  creator: "Daniel Rayo",
  publisher: "Daniel Rayo",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico", 
  },

  openGraph: {
    title: "DaniRayo3D | Game Developer & Artista 3D",
    description: "Descubre los proyectos 3D y videojuegos de Daniel Rayo (Malegro 32).",
    url: "https://danirayo3d.es",
    siteName: "DaniRayo3D Portfolio",
    images: [
      {
        url: "/favicon.ico", 
        width: 800,
        height: 600,
        alt: "Logo DaniRayo3D",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "DaniRayo3D | Daniel Rayo",
    description: "Portfolio de Game Developer y Artista 3D.",
  },
};

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-red-500/30 overflow-x-hidden`}>
        <AdminProvider>
          <UiProvider> {/* <--- ENVOLVER AQUÍ */}
            
            {/* Pantalla de carga inicial */}
            <WelcomeScreen />

            {/* --- ELEMENTOS DE ESCRITORIO --- */}
            <div className="hidden md:block">
              <Header />
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            {children}

            {/* --- FOOTER DE ESCRITORIO --- */}
            <div className="hidden md:block">
              <Footer />
            </div>
            
            {/* Controles de Admin */}
            <AdminControls />
            
          </UiProvider> {/* <--- CIERRE */}
        </AdminProvider>
      </body>
    </html>
  );
}