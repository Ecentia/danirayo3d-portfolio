"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ServerCog, ShieldAlert, Lock } from "lucide-react";
import Link from "next/link";
// ✅ Importamos la versión móvil
import MobileMaintenance from "./mobile/MobileMaintenance";

export default function MaintenanceScreen() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Evitar hidration mismatch mostrando un fondo neutro un instante
  if (isMobile === null) return <div className="fixed inset-0 bg-black" />;

  // ✅ Si es móvil, devolvemos el nuevo componente
  if (isMobile) {
    return <MobileMaintenance />;
  }

  // 🖥️ Si es escritorio, devolvemos tu diseño original actualizado
  return (
    <div className="fixed inset-0 min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 relative z-[100] overflow-hidden font-mono text-white">
      {/* Efecto de luz volumétrica roja de fondo (Alerta) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none z-[-1]" />

      {/* Grid rojo tenue de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f0000_1px,transparent_1px),linear-gradient(to_bottom,#4f0000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 z-[-1]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-2xl relative"
      >
        {/* Decoración superior */}
        <div className="flex items-center gap-4 mb-8 justify-center">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-600"></div>
          <span className="text-red-500 font-bold text-xs tracking-[0.4em] uppercase flex items-center gap-2 animate-pulse">
            <ShieldAlert size={14} />
            RESTRICTED_AREA
          </span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-red-600"></div>
        </div>

        {/* Icono central animado */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="relative mb-8 text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          <ServerCog size={80} strokeWidth={1} />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center text-white"
          >
            <Lock size={30} strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Textos Principales */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-md mb-6"
        >
          System <span className="text-red-600">Offline</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-12"
        >
          The platform is currently undergoing scheduled core upgrades and
          maintenance. The geometry is being recalculated.
          <br />
          <br />
          <span className="text-neutral-300">
            Please return when the render is complete.
          </span>
        </motion.p>

        {/* Barra de progreso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-md h-1 bg-white/10 rounded-full overflow-hidden mb-12 relative"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"
          />
        </motion.div>

        {/* Admin Override */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link
            href="/admin"
            className="text-[10px] text-neutral-600 hover:text-red-500 transition-colors tracking-widest uppercase flex items-center gap-2"
          >
            <Lock size={10} />
            Admin Override
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
