"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig } from "framer-motion";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import MobileShell from "@/components/mobile/MobileShell";
import IntroLoader from "@/components/IntroLoader";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

// Three.js + drei pesan más de 1 MB: solo se descargan en escritorio.
// Antes la escena 3D se montaba (oculta con CSS) también en móvil.
const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });

type ViewportKind = "desktop" | "mobile";
type GpuStatus = "checking" | "ok" | "error";

const DESKTOP_QUERY = "(min-width: 768px)";
// Evita un parpadeo del loader cuando todo está en caché
const MIN_LOADER_MS = 900;
// Nadie se queda atrapado en el loader si un asset se cuelga sin lanzar error
const LOADER_SAFETY_TIMEOUT_MS = 12000;

function hasHardwareAcceleration(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;

    const dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbgRenderInfo) {
      const renderer = String(gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL) || "");
      if (/swiftshader|software|llvmpipe|microsoft basic|google rendering/i.test(renderer)) {
        return false;
      }
    }

    // Liberamos el contexto de prueba: los navegadores limitan los contextos WebGL vivos
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch (err) {
    console.warn("[GPU] No se pudo comprobar la aceleración por hardware:", err);
    return false;
  }
}

export default function Home() {
  const { isSpanish } = useLanguage();

  const [viewport, setViewport] = useState<ViewportKind | null>(null);
  const [gpuStatus, setGpuStatus] = useState<GpuStatus>("checking");

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  const [sceneProgress, setSceneProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // 1. Escritorio o móvil (reactivo a cambios de tamaño)
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setViewport(mq.matches ? "desktop" : "mobile");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 2. Verificar aceleración por hardware solo cuando se va a usar WebGL
  useEffect(() => {
    if (viewport !== "desktop" || gpuStatus !== "checking") return;
    setGpuStatus(hasHardwareAcceleration() ? "ok" : "error");
  }, [viewport, gpuStatus]);

  // 3. Estado de mantenimiento, en paralelo a la carga de la escena
  useEffect(() => {
    let cancelled = false;

    const checkSystemState = async () => {
      // Si Supabase no responde (proyecto pausado, red caída...) la web debe
      // seguir cargando: sin el finally, checking se quedaba en true y la
      // pantalla permanecía en negro indefinidamente.
      try {
        const { data: maintenanceData, error } = await supabase
          .from("portfolio_content")
          .select("description")
          .eq("section_id", "maintenance")
          .maybeSingle();

        if (error) {
          console.error("[Mantenimiento] No se pudo comprobar el estado:", error.message);
        }

        const isLocked = maintenanceData?.description === "true";

        if (isLocked) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session && !cancelled) {
            setIsMaintenance(true);
          }
        }
      } catch (err) {
        console.error("[Mantenimiento] Error inesperado comprobando el estado:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    checkSystemState();
    return () => {
      cancelled = true;
    };
  }, []);

  // 4. Temporizadores del loader
  useEffect(() => {
    const minTimer = setTimeout(() => setMinTimeElapsed(true), MIN_LOADER_MS);
    const safetyTimer = setTimeout(() => setTimedOut(true), LOADER_SAFETY_TIMEOUT_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  const contentReady =
    !checking &&
    viewport !== null &&
    (viewport === "mobile" || gpuStatus === "error" || isMaintenance || sceneReady);

  useEffect(() => {
    if (!showLoader) return;
    if (contentReady && minTimeElapsed) {
      setShowLoader(false);
    } else if (timedOut) {
      console.warn("[Loader] Tiempo máximo de carga alcanzado; se muestra la web igualmente.");
      setShowLoader(false);
    }
  }, [contentReady, minTimeElapsed, timedOut, showLoader]);

  const handleSceneProgress = useCallback((value: number) => {
    // El LoadingManager de three reinicia el porcentaje entre tandas de assets;
    // nunca dejamos que la barra retroceda.
    if (!Number.isFinite(value)) return;
    setSceneProgress((prev) => Math.max(prev, value));
  }, []);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  let loaderProgress = 6;
  if (contentReady) {
    loaderProgress = 100;
  } else if (viewport === "desktop") {
    // 0-12 descarga del chunk 3D, 12-90 assets reales, 90-100 compilación de shaders
    loaderProgress = 12 + Math.min(sceneProgress, 100) * 0.78;
  } else if (viewport === "mobile") {
    loaderProgress = checking ? 55 : 90;
  }

  let content: React.ReactNode = null;
  if (isMaintenance) {
    content = <MaintenanceScreen />;
  } else if (viewport === "mobile") {
    content = <MobileShell />;
  } else if (viewport === "desktop" && gpuStatus === "error") {
    content = <GpuUnavailableScreen isSpanish={isSpanish} />;
  } else if (viewport === "desktop" && gpuStatus === "ok") {
    // Se monta detrás del loader para que texturas y shaders estén listos al revelarse
    content = (
      <main className="relative z-0 h-screen w-full overflow-hidden">
        <Hero
          onProgress={handleSceneProgress}
          onReady={handleSceneReady}
          introActive={showLoader}
        />
      </main>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {showLoader && (
          <IntroLoader key="intro-loader" progress={loaderProgress} isSpanish={isSpanish} />
        )}
      </AnimatePresence>
      {content}
    </MotionConfig>
  );
}

function GpuUnavailableScreen({ isSpanish }: { isSpanish: boolean }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-white">
      <div className="animate-fade-in flex w-full max-w-md flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl">
        <span className="mx-auto h-1.5 w-1.5 rounded-full bg-rayo-red" />
        <h2 className="text-xl font-semibold tracking-tight">
          {isSpanish ? "Aceleración por hardware desactivada" : "Hardware acceleration is off"}
        </h2>
        <p className="text-sm leading-relaxed text-white/55">
          {isSpanish
            ? "Esta experiencia interactiva en 3D requiere aceleración por hardware para ejecutarse con fluidez y evitar sobrecargar tu procesador."
            : "This interactive 3D experience needs hardware acceleration to run smoothly without overloading your CPU."}
        </p>
        <div className="h-px w-full bg-white/10" />
        <ol className="space-y-1.5 text-left text-xs leading-relaxed text-white/45">
          <li>
            1. {isSpanish ? "Abre los ajustes de tu navegador (Chrome, Edge, etc.)." : "Open your browser settings (Chrome, Edge, etc.)."}
          </li>
          <li>
            2. {isSpanish ? "Busca " : "Search for "}
            <strong className="text-white/70">
              &quot;{isSpanish ? "Aceleración por hardware" : "Hardware acceleration"}&quot;
            </strong>
            .
          </li>
          <li>
            3.{" "}
            {isSpanish
              ? "Activa \"Usar aceleración por hardware cuando esté disponible\"."
              : "Enable \"Use hardware acceleration when available\"."}
          </li>
          <li>4. {isSpanish ? "Reinicia el navegador e intenta entrar de nuevo." : "Restart the browser and try again."}</li>
        </ol>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 cursor-pointer rounded-full bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-rayo-red hover:text-white"
        >
          {isSpanish ? "Recomprobar" : "Check again"}
        </button>
      </div>
    </div>
  );
}
