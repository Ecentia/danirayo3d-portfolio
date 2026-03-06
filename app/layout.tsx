import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import { UiProvider } from "@/context/UiContext";
import AdminControls from "@/components/AdminControls";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundEffects from "@/components/layout/BackgroundEffects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ================================================================
// SEO MAESTRO BILINGÜE — DaniRayo3D / Daniel Rayo — Artista 3D
// Optimizado para ES + EN | Local SEO Sevilla + Internacional
// ================================================================

export const metadata: Metadata = {
  metadataBase: new URL("https://danirayo3d.es"),

  // --- TITLE ---
  // El template se usa en páginas internas (e.g. "Proyectos | DaniRayo3D")
  title: {
    default: "DaniRayo3D | Daniel Rayo – Artista 3D · 3D Artist · Sevilla",
    template: "%s | DaniRayo3D – Artista 3D",
  },

  // --- DESCRIPTION ---
  // ~155 caracteres. Primera frase = lo más importante (aparece en snippet de Google).
  // Incluye identidad, especialidad, ciudad (SEO local) y CTA implícito.
  description:
    "Daniel Rayo (DaniRayo3D) — Artista 3D freelance en Sevilla, España. Especializado en modelado 3D, entornos, personajes, texturizado y renders. Disponible para proyectos en Blender y Unreal Engine. 3D Artist based in Seville, Spain, open to freelance and remote work worldwide.",

  // --- KEYWORDS ---
  // Google dice que no las usa directamente para ranking, pero otros motores SÍ.
  // Inclúyelas de todas formas: no perjudican y algunos scrapers las usan.
  keywords: [
    // ——— IDENTIDAD ———
    "Daniel Rayo",
    "Dani Rayo",
    "DaniRayo3D",
    "Dani Rayo 3D",
    "Daniel Rayo 3D",
    "Malegro 32",
    "Malegro 3D",

    // ——— ROL PROFESIONAL (ES) ———
    "Artista 3D",
    "Artista 3D Sevilla",
    "Artista 3D España",
    "Artista 3D freelance",
    "Artista 3D freelance Sevilla",
    "Diseñador 3D",
    "Diseñador 3D Sevilla",
    "Modelador 3D",
    "Modelador 3D Sevilla",
    "Modelador 3D freelance",
    "Artista digital 3D",
    "Creador de contenido 3D",
    "Especialista en modelado 3D",
    "Artista de entornos 3D",
    "Artista de personajes 3D",
    "Visualizador 3D",
    "Render artista",
    "Artista de renders",
    "Artista 3D Andalucía",
    "Artista 3D España freelance",

    // ——— ROL PROFESIONAL (EN) ———
    "3D Artist",
    "3D Artist Seville",
    "3D Artist Spain",
    "3D Artist freelance",
    "3D Artist Andalusia",
    "3D Generalist",
    "3D Modeler",
    "3D Modeler freelance",
    "Environment Artist",
    "Environment Artist 3D",
    "Character Artist",
    "Character Artist 3D",
    "3D Character Modeler",
    "3D Environment Modeler",
    "Digital 3D Artist",
    "Freelance 3D Artist",
    "Freelance 3D Modeler",
    "3D Visualization Artist",
    "Render Artist",
    "3D Render Specialist",

    // ——— ESPECIALIDADES / TÉCNICAS (ES) ———
    "Modelado 3D",
    "Modelado orgánico",
    "Modelado hard surface",
    "Texturizado 3D",
    "Texturizado PBR",
    "Materiales PBR",
    "Iluminación 3D",
    "Renders fotorrealistas",
    "Renders arquitectónicos",
    "Visualización 3D",
    "Animación 3D",
    "Sculpting digital",
    "Rigging 3D",
    "Diseño de personajes",
    "Diseño de entornos",
    "Arte conceptual 3D",
    "Portfolio artista 3D",
    "Portfolio 3D Sevilla",

    // ——— ESPECIALIDADES / TÉCNICAS (EN) ———
    "3D modeling",
    "Organic modeling",
    "Hard surface modeling",
    "3D texturing",
    "PBR texturing",
    "PBR materials",
    "3D lighting",
    "Photorealistic renders",
    "Architectural visualization",
    "3D visualization",
    "3D animation",
    "Digital sculpting",
    "3D rigging",
    "Character design",
    "Environment design",
    "3D concept art",
    "3D portfolio",
    "3D artist portfolio",

    // ——— SOFTWARE ———
    "Blender",
    "Blender 3D",
    "Blender artista",
    "Blender artist",
    "Unreal Engine",
    "Unreal Engine 5",
    "Unreal Engine 5 artista",
    "Substance Painter",
    "Substance Designer",
    "ZBrush",
    "Maya",
    "3ds Max",
    "Marmoset Toolbag",
    "KeyShot",
    "Photoshop",

    // ——— SEO LOCAL (SEVILLA / ESPAÑA) ———
    "Artista 3D Sevilla",
    "Diseñador 3D Sevilla",
    "Profesional 3D Sevilla",
    "Freelance 3D Sevilla",
    "Modelador 3D España",
    "Artista 3D España",
    "3D Artist Seville Spain",
    "3D freelancer Spain",
    "3D freelancer Seville",
    "Servicios 3D Sevilla",
    "Estudio 3D Sevilla",

    // ——— SERVICIOS / CASOS DE USO ———
    "Servicios de modelado 3D",
    "Encargo artista 3D",
    "Contratar artista 3D",
    "Contratar modelador 3D",
    "Hire 3D artist",
    "Hire 3D modeler",
    "Commission 3D artist",
    "3D commission",
    "Freelance 3D services",
    "3D art services",
    "Custom 3D models",
    "Modelos 3D personalizados",
  ],

  // --- AUTORES Y CREADORES ---
  authors: [{ name: "Daniel Rayo", url: "https://danirayo3d.es" }],
  creator: "Daniel Rayo",
  publisher: "Daniel Rayo",

  // --- ROBOTS ---
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

  // --- ICONOS ---
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  // --- OPEN GRAPH (Facebook, LinkedIn, WhatsApp, Discord...) ---
  openGraph: {
    title: "DaniRayo3D | Daniel Rayo – Artista 3D · 3D Artist",
    description:
      "Portfolio de Daniel Rayo (DaniRayo3D): Artista 3D especializado en modelado, entornos y personajes. Blender · Unreal Engine · Sevilla, España. Open to worldwide freelance projects.",
    url: "https://danirayo3d.es",
    siteName: "DaniRayo3D – Portfolio Artista 3D",
    images: [
      {
        url: "/og-image.jpg", // ⚠️ Reemplaza con tu imagen OG real (1200x630px recomendado)
        width: 1200,
        height: 630,
        alt: "DaniRayo3D – Daniel Rayo, Artista 3D · 3D Artist – Portfolio",
        type: "image/jpeg",
      },
    ],
    locale: "es_ES",
    alternateLocale: ["en_US", "en_GB"],
    type: "website",
  },

  // --- TWITTER / X CARD ---
  twitter: {
    card: "summary_large_image",
    title: "DaniRayo3D | Daniel Rayo – Artista 3D",
    description:
      "Portfolio de Daniel Rayo: modelado 3D, entornos, personajes. Blender · Unreal Engine · Sevilla, Spain.",
    images: ["/og-image.jpg"], // ⚠️ Misma imagen OG
    // creator: "@TuTwitterHandle", // ← Añade tu @handle si tienes Twitter/X
  },

  // --- CANONICAL & IDIOMAS ALTERNATIVOS ---
  // Esto le dice a Google qué URL es la "oficial" y que existe versión en inglés
  alternates: {
    canonical: "https://danirayo3d.es",
    languages: {
      "es-ES": "https://danirayo3d.es",
      "en-US": "https://danirayo3d.es/en", // Descomenta si creas ruta /en
    },
  },

  // --- VERIFICACIÓN DE PROPIEDAD (rellena cuando tengas los códigos) ---
  // verification: {
  //   google: "TU_CÓDIGO_GOOGLE_SEARCH_CONSOLE",
  //   yandex: "TU_CÓDIGO_YANDEX",
  // },

  // --- CATEGORÍA (ayuda a clasificadores de IA y scrapers) ---
  category: "Art & Design",
};

// --- VIEWPORT ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030000",
};

// ================================================================
// JSON-LD — DATOS ESTRUCTURADOS PARA GOOGLE
// Aparece en rich results: Knowledge Panel, sitelinks, breadcrumbs
// ================================================================

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // --- Persona / Profesional ---
    {
      "@type": "Person",
      "@id": "https://danirayo3d.es/#daniel-rayo",
      name: "Daniel Rayo",
      alternateName: ["DaniRayo3D", "Malegro 32", "Dani Rayo"],
      url: "https://danirayo3d.es",
      image: "https://danirayo3d.es/og-image.jpg",
      description:
        "Artista 3D freelance especializado en modelado 3D, entornos y personajes. Basado en Sevilla, España. Disponible para proyectos remotos a nivel mundial.",
      jobTitle: ["Artista 3D", "3D Artist", "3D Generalist"],
      knowsAbout: [
        "Modelado 3D",
        "3D Modeling",
        "Texturizado PBR",
        "PBR Texturing",
        "Blender",
        "Unreal Engine",
        "Environment Art",
        "Character Art",
        "3D Rendering",
        "Digital Sculpting",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sevilla",
        addressRegion: "Andalucía",
        addressCountry: "ES",
      },
      sameAs: [
        // ⚠️ Añade tus perfiles reales:
        // "https://www.artstation.com/danirayo3d",
        // "https://www.linkedin.com/in/danielrayo3d",
        // "https://www.instagram.com/danirayo3d",
        // "https://twitter.com/TuHandle",
        // "https://danirayo3d.artstation.com",
      ],
    },
    // --- Sitio Web ---
    {
      "@type": "WebSite",
      "@id": "https://danirayo3d.es/#website",
      url: "https://danirayo3d.es",
      name: "DaniRayo3D – Portfolio Artista 3D",
      description:
        "Portfolio oficial de Daniel Rayo (DaniRayo3D). Artista 3D freelance en Sevilla, España. Trabajos de modelado 3D, entornos, personajes y renders.",
      inLanguage: ["es-ES", "en"],
      author: { "@id": "https://danirayo3d.es/#daniel-rayo" },
      // Habilita el cuadro de búsqueda en los resultados de Google:
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://danirayo3d.es/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    // --- Servicio Profesional (Freelance) ---
    {
      "@type": "Service",
      name: "Servicios de Artista 3D Freelance",
      description:
        "Servicios profesionales de modelado 3D, texturizado, renders y diseño de entornos y personajes para proyectos creativos, arquitectura e industria. Disponible de forma remota.",
      provider: { "@id": "https://danirayo3d.es/#daniel-rayo" },
      serviceType: "3D Art & Modeling",
      areaServed: [
        {
          "@type": "Country",
          name: "España",
        },
        {
          "@type": "AdministrativeArea",
          name: "Sevilla",
        },
        {
          "@type": "Country",
          name: "International / Remote",
        },
      ],
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://danirayo3d.es",
      },
    },
  ],
};

// ================================================================
// ROOT LAYOUT
// ================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-white selection:bg-red-500/30 overflow-x-hidden min-h-screen relative`}
      >
        {/* --- SISTEMA DE CAPAS DE FONDO --- */}

        {/* CAPA 1: Fondo con degradado radial */}
        <div
          className="fixed inset-0 z-[-50]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, #1a0505 0%, #050101 50%, #000000 100%)",
          }}
        />

        {/* CAPA 2: Luces Volumétricas */}
        <BackgroundEffects />

        {/* CAPA 3: Grid Tecnológico */}
        <div className="cyber-grid" />

        {/* CAPA 4: Ruido de Cine */}
        <div className="noise-overlay" />

        {/* CAPA 5: Viñeta */}
        <div className="vignette" />

        <AdminProvider>
          <UiProvider>
            <div className="relative">
              <div className="hidden md:block">
                <Header />
              </div>

              <main className="min-h-screen">{children}</main>

              <div className="hidden md:block">
                <Footer />
              </div>
            </div>

            <AdminControls />
          </UiProvider>
        </AdminProvider>
      </body>
    </html>
  );
}