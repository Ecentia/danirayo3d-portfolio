"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface IntroLoaderProps {
  /** Progreso objetivo 0-100. El valor mostrado se interpola hacia él. */
  progress: number;
  isSpanish: boolean;
}

const clampProgress = (value: number): number =>
  Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

export default function IntroLoader({ progress, isSpanish }: IntroLoaderProps) {
  const [displayed, setDisplayed] = useState(0);
  const targetRef = useRef(0);

  useEffect(() => {
    targetRef.current = clampProgress(progress);
  }, [progress]);

  // El progreso real llega a saltos (texturas, HDR, shaders); lo suavizamos
  // con interpolación exponencial para que la barra nunca dé tirones.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setDisplayed((prev) => {
        const next = prev + (targetRef.current - prev) * (1 - Math.exp(-dt * 5));
        return Math.abs(targetRef.current - next) < 0.1 ? targetRef.current : next;
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const rounded = Math.round(displayed);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={isSpanish ? `Cargando ${rounded}%` : `Loading ${rounded}%`}
      initial={{ opacity: 1 }}
      // Solo opacidad: un blur a pantalla completa durante la salida provocaba tirones
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      className="fixed inset-0 z-[10000] select-none bg-[#050505] font-sans text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="text-2xl font-medium tracking-[-0.03em] text-white/90">Daniel Rayo</span>
      </motion.div>

      <div className="absolute inset-x-8 bottom-8 flex items-end justify-between text-[13px] text-white/40">
        <span>{isSpanish ? "Artista 3D" : "3D artist"}</span>
        <span className="tabular-nums text-white/70">{rounded}%</span>
      </div>

      {/* scaleX en lugar de width: se compone en GPU sin recalcular layout cada frame */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10">
        <div
          className="h-full origin-left bg-rayo-red"
          style={{ transform: `scaleX(${displayed / 100})` }}
        />
      </div>
    </motion.div>
  );
}
