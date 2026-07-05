"use client";

// --- IMPORTS DE ESCRITORIO ---
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
  // ---- ESTADOS PARA EL PRECARGADOR Y GPU CHECK ----
  const [gpuStatus, setGpuStatus] = useState<"checking" | "ok" | "error">("checking");
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);

  // ---- NUEVOS ESTADOS PARA EL MANTENIMIENTO ----
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  React.useEffect(() => {
    // 1. Verificar aceleración por hardware / WebGL
    const checkGPU = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
        if (!gl) return false;

        const dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbgRenderInfo) {
          const renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL) || "";
          if (/swiftshader|software|llvmpipe|microsoft basic|google rendering/i.test(renderer)) {
            return false;
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    };

    const isDesk = window.innerWidth >= 768;
    const hasGPU = checkGPU();

    if (isDesk && !hasGPU) {
      setGpuStatus("error");
      setChecking(false);
      return;
    }

    setGpuStatus("ok");

    // 2. Si es móvil o tiene GPU, comprobar estado del sistema (mantenimiento)
    const checkSystemState = async () => {
      const { data: maintenanceData } = await supabase
        .from("portfolio_content")
        .select("description")
        .eq("section_id", "maintenance")
        .maybeSingle();

      const isLocked = maintenanceData?.description === "true";

      if (isLocked) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsMaintenance(true);
        }
      }
      setChecking(false); // Terminamos de comprobar
    };

    checkSystemState();

    // 3. Simulación de barra de progreso para amortiguar el compilador WebGL
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setShowLoader(false);
        }, 300);
      }
      setProgress(currentProgress);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // Determinar log de telemetría basado en el progreso
  const getTelemetryLog = (p: number) => {
    if (p < 20) return "SYSTEM: INITIALIZING QUANTUM CORE...";
    if (p < 40) return "ORBIT: CALCULATING PLANETARY TRAJECTORIES...";
    if (p < 60) return "SHADERS: COMPILING GRAPHICS COMPLEMENTS...";
    if (p < 80) return "NETWORK: SECURING SUPABASE DATA STREAM...";
    if (p < 100) return "GRAPHICS: INJECTING CYBERPUNK GRID NEST...";
    return "READY: BOOTING PORTFOLIO EXPERIENCE...";
  };

  // Si está desactivada la aceleración por hardware en Escritorio, se le bloquea y advierte
  if (gpuStatus === "error") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono text-white px-6">
        <div className="border border-red-500/30 bg-red-950/10 p-8 rounded-lg max-w-md w-full flex flex-col items-center gap-4 text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-fade-in">
          <svg className="w-16 h-16 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-red-500 font-bold text-lg uppercase tracking-wider">
            Aceleración por Hardware Desactivada
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Esta experiencia interactiva en 3D requiere aceleración por hardware para ejecutarse con fluidez y evitar sobrecargar tu procesador.
          </p>
          <div className="w-full h-[1px] bg-red-500/20 my-2"></div>
          <div className="text-zinc-500 text-[10px] leading-relaxed text-left space-y-1">
            <strong className="text-zinc-400">Cómo solucionarlo:</strong>
            <p>1. Abre los ajustes de tu navegador (Chrome, Edge, etc.).</p>
            <p>2. Busca <strong>&quot;Aceleración por hardware&quot;</strong> o <strong>&quot;Sistema&quot;</strong>.</p>
            <p>3. Activa la opción <strong>&quot;Usar aceleración por hardware cuando esté disponible&quot;</strong>.</p>
            <p>4. Reinicia tu navegador e intenta entrar de nuevo.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 border border-red-500/50 hover:bg-red-500/20 text-red-400 font-bold tracking-widest text-xs rounded transition-all uppercase cursor-pointer"
          >
            Recomprobar
          </button>
        </div>
      </div>
    );
  }

  // Mientras comprueba la base de datos, mostramos pantalla negra
  if (checking) return <div className="min-h-screen bg-[#050505]"></div>;

  // Si está en mantenimiento y NO es admin, mostramos la pantalla de bloqueo
  if (isMaintenance) {
    return <MaintenanceScreen />;
  }

  // A PARTIR DE AQUÍ VA EL RESTO DE TU CÓDIGO NORMAL DE LA WEB...
  return (
    <>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center font-mono text-white"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Telemetría animada */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-red-500/80 uppercase tracking-[0.25em] font-semibold animate-pulse">
                  {getTelemetryLog(progress)}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest text-center">
                  Loading Assets & Shaders
                </span>
              </div>

              {/* Contenedor de la barra de progreso */}
              <div className="relative">
                {/* Barra de fondo */}
                <div className="w-72 h-[3px] bg-zinc-900 rounded-full overflow-hidden relative border border-white/5">
                  {/* Barra de progreso con resplandor */}
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-100 ease-out"
                    style={{
                      width: `${progress}%`,
                      boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
                    }}
                  />
                </div>
                {/* Porcentaje flotante */}
                <div className="absolute right-0 -bottom-5 text-[9px] text-zinc-400 font-bold">
                  {progress}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <main className="hidden md:block w-full h-screen overflow-hidden relative z-0">
        {/* 1. HERO SECTION (NUEVO) */}
        <Hero />

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
