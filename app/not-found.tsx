"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Box, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 overflow-hidden relative z-10">
      {/* Efecto de luz volumétrica roja de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid rojo tenue de fondo (refuerzo visual) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f0000_1px,transparent_1px),linear-gradient(to_bottom,#4f0000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 z-[-1]" />

      <div className="z-10 text-center space-y-10 flex flex-col items-center">
        {/* Número 404 con Efecto GLITCH */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="relative"
        >
          {/* Capa de error roja */}
          <motion.h1
            animate={{ x: [-3, 3, -1, 2, 0], y: [1, -1, 2, -2, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
              repeatType: "mirror",
            }}
            className="absolute top-0 left-1 md:left-2 text-9xl md:text-[180px] font-black text-red-600 opacity-60 blur-[1px] select-none mix-blend-screen"
          >
            404
          </motion.h1>

          {/* Capa de error cyan */}
          <motion.h1
            animate={{ x: [3, -3, 1, -2, 0], y: [-1, 1, -2, 2, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "linear",
              repeatType: "mirror",
            }}
            className="absolute top-0 -left-1 md:-left-2 text-9xl md:text-[180px] font-black text-cyan-500 opacity-40 blur-[1px] select-none mix-blend-screen"
          >
            404
          </motion.h1>

          {/* Texto principal */}
          <h1 className="relative text-9xl md:text-[180px] font-black text-white drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] z-10">
            404
          </h1>

          {/* Cubo 3D flotante (Lucide Box) girando */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotateX: [0, 180, 360],
              rotateY: [0, 180, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
            className="absolute -top-8 -right-4 md:-top-16 md:-right-16 text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] z-20"
          >
            <Box size={70} strokeWidth={1} />
          </motion.div>
        </motion.div>

        {/* Sistema de Boot - Detalle Cyberpunk a juego con tu página */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center gap-4"
        >
          <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-red-600"></div>
          <span className="text-red-500 font-bold text-xs md:text-sm tracking-[0.4em] uppercase animate-pulse">
            MISSING POLYGONS...
          </span>
          <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-red-600"></div>
        </motion.div>

        {/* Textos descriptivos tematizados */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4 relative z-20"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-md">
            Lost in the viewport
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-base md:text-lg">
            The coordinates you are trying to access have been removed from this
            geometry. Please check your tracking or restart the render.
          </p>
        </motion.div>

        {/* Botón Exacto al de "EXPLORE" de tu Home */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-6 z-20"
        >
          <Link href="/">
            <button className="relative group px-10 py-4 bg-black/40 border border-white/10 hover:border-red-600 overflow-hidden transition-all duration-500 backdrop-blur-md rounded-sm">
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 text-white font-black text-sm md:text-lg tracking-[0.2em] flex items-center gap-3">
                <ArrowLeft
                  size={18}
                  className="text-red-500 group-hover:text-white transition-colors"
                />
                REBOOT SYSTEM
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
