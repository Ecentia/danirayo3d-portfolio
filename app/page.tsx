"use client";

// --- IMPORTS DE ESCRITORIO ---
import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { supabase } from "@/lib/supabase";
import AboutMe from "@/components/sections/AboutMe";
import ProjectsGrid from "@/components/sections/ProjectGrid";
import TechStack from "@/components/sections/TechStack";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";

// --- IMPORT DEL NUEVO HERO ---
import Hero from "@/components/Hero";

// --- IMPORT DE LA APP MÓVIL ---
// Asegúrate de haber creado este componente en la carpeta correcta
import MobileShell from "@/components/mobile/MobileShell";
import SketchfabGallery from "@/components/sections/SketchfabGallery";

// --- CONFIGURACIÓN DE ANIMACIONES WEB ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const revealSide = (direction: "left" | "right"): Variants => ({
  hidden: { opacity: 0, x: direction === "left" ? -100 : 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
});

export default function Home() {
  // ---- NUEVOS ESTADOS PARA EL MANTENIMIENTO ----
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  React.useEffect(() => {
    const checkSystemState = async () => {
      // 1. Mirar si el candado está puesto en la base de datos (Buscando en description)
      const { data: maintenanceData } = await supabase
        .from("portfolio_content")
        .select("description")
        .eq("section_id", "maintenance")
        .maybeSingle();

      const isLocked = maintenanceData?.description === "true";

      if (isLocked) {
        // 2. Si está puesto, comprobamos si la persona que entra es el ADMIN
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Si NO hay sesión (visitante), le bloqueamos la vista
        if (!session) {
          setIsMaintenance(true);
        }
      }
      setChecking(false); // Terminamos de comprobar
    };

    checkSystemState();
  }, []);

  // Mientras comprueba la base de datos, mostramos pantalla negra
  if (checking) return <div className="min-h-screen bg-[#050505]"></div>;

  // Si está en mantenimiento y NO es admin, mostramos la pantalla de bloqueo
  if (isMaintenance) {
    return <MaintenanceScreen />;
  }

  // A PARTIR DE AQUÍ VA EL RESTO DE TU CÓDIGO NORMAL DE LA WEB...
  return (
    <>
      {/* ================================================= */}
      {/* MUNDO 1: APP MÓVIL (Visible < 768px)              */}
      {/* ================================================= */}
      <div className="md:hidden">
        {/* MobileShell es una App SPA completa, ocupa todo el viewport */}
        <MobileShell />
      </div>

      {/* ================================================= */}
      {/* MUNDO 2: WEB ESCRITORIO (Visible >= 768px)        */}
      {/* ================================================= */}
      <main className="hidden md:block w-full min-h-screen relative z-0">
        {/* 1. HERO SECTION (NUEVO) */}
        <Hero />

        {/* 2. ABOUT ME & TECH STACK */}
        <div id="sobre-mi" className="relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <AboutMe />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <TechStack />
          </motion.div>
        </div>

        {/* 3. DIVISOR DE SECCIÓN */}
        <div className="w-full py-20 flex justify-center items-center gap-4 opacity-20">
          <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent to-white"></div>
          <div className="w-2 h-2 rotate-45 border border-white"></div>
          <div className="h-[1px] w-full max-w-xs bg-gradient-to-l from-transparent to-white"></div>
        </div>

        {/* 4. PROYECTOS */}
        <div id="proyectos" className="scroll-mt-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealSide("left")}
          >
            <ProjectsGrid />
          </motion.div>
        </div>

        {/* 4. PROYECTOS (SKETCHFAB) */}
        <div id="proyectos" className="scroll-mt-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealSide("left")}
          >
            <SketchfabGallery />
          </motion.div>
        </div>

        {/* 5. TRAYECTORIA */}
        <div id="trayectoria" className="scroll-mt-24">
          <div className="w-full py-20 flex justify-center items-center gap-4 opacity-20">
            <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent to-red-600"></div>
            <div className="w-2 h-2 rotate-45 border border-red-600"></div>
            <div className="h-[1px] w-full max-w-xs bg-gradient-to-l from-transparent to-red-600"></div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealSide("right")}
          >
            <Experience />
          </motion.div>
        </div>

        {/* 6. CONTACTO */}
        <div id="contacto" className="scroll-mt-24 mb-20">
          <div className="w-full py-10 flex justify-center items-center gap-4 opacity-20">
            <div className="h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent to-red-600"></div>
            <div className="w-2 h-2 rotate-45 border border-red-600"></div>
            <div className="h-[1px] w-full max-w-xs bg-gradient-to-l from-transparent to-red-600"></div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Contact />
          </motion.div>
        </div>

        {/* ESTILOS GLOBALES EFECTO GLITCH CONSTANTE (Sin fondo negro) */}
        <style jsx global>{`
          .cyber-glitch {
            position: relative;
          }

          /* Creamos dos copias exactas del texto, superpuestas, pero con fondo transparente */
          .cyber-glitch::before,
          .cyber-glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent; /* ✅ NADA de fondos negros */
            pointer-events: none;
            color: white; /* El texto es blanco como el original */
          }

          /* Capa Roja (Se desfasa a la izquierda y tiene sombra roja) */
          .cyber-glitch::before {
            left: 3px;
            text-shadow: -2px 0 #ff0000;
            animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
          }

          /* Capa Cyan (Se desfasa a la derecha y tiene sombra cyan) */
          .cyber-glitch::after {
            left: -3px;
            text-shadow: 2px 0 #00ffff;
            animation: glitch-anim-2 3s infinite linear alternate-reverse;
          }

          /* Animación agresiva de cortes horizontales (Capa 1) */
          @keyframes glitch-anim-1 {
            0% {
              clip-path: inset(20% 0 80% 0);
              transform: translate(-2px, 1px);
            }
            20% {
              clip-path: inset(60% 0 10% 0);
              transform: translate(2px, -1px);
            }
            40% {
              clip-path: inset(40% 0 50% 0);
              transform: translate(-2px, 2px);
            }
            60% {
              clip-path: inset(80% 0 5% 0);
              transform: translate(2px, -2px);
            }
            80% {
              clip-path: inset(10% 0 70% 0);
              transform: translate(-1px, 1px);
            }
            100% {
              clip-path: inset(30% 0 50% 0);
              transform: translate(1px, -1px);
            }
          }

          /* Animación agresiva de cortes horizontales (Capa 2) */
          @keyframes glitch-anim-2 {
            0% {
              clip-path: inset(10% 0 60% 0);
              transform: translate(2px, -1px);
            }
            20% {
              clip-path: inset(30% 0 20% 0);
              transform: translate(-2px, 2px);
            }
            40% {
              clip-path: inset(70% 0 10% 0);
              transform: translate(1px, -1px);
            }
            60% {
              clip-path: inset(20% 0 50% 0);
              transform: translate(-1px, 2px);
            }
            80% {
              clip-path: inset(50% 0 30% 0);
              transform: translate(2px, -2px);
            }
            100% {
              clip-path: inset(5% 0 80% 0);
              transform: translate(-2px, 1px);
            }
          }
        `}</style>
      </main>
    </>
  );
}
