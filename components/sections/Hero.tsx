"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  // Animaciones correctamente tipadas con 'Variants' para evitar el error TS2322
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Retraso entre elementos
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* --- FONDO ATMOSFÉRICO --- */}
      {/* Gradiente radial de profundidad */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#0a0a0a_70%)]" />

      {/* Luces de estudio simuladas (Cian a la izquierda, Rojo a la derecha) */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40vw] h-[40vw] bg-cyan-950/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[40vw] h-[40vw] bg-red-950/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Grid sutil de fondo */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* TEXTO (Izquierda) */}
        <motion.div
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={itemVariants}
            className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase mb-3 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-800"
          >
            Digital Artisan / workflow Specialist
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter leading-none mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            DANI
            <br />
            <span className="text-red-600">RAYO</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-lg md:text-xl max-w-lg mb-10 font-light"
          >
            Especializado en la creación de personajes, assets 3D y optimización
            de pipelines de arte digital. Transformando conceptos en realidad
            renderizada.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="#proyectos">
              <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-2">
                VER PROYECTOS
                <span>→</span>
              </button>
            </Link>
            <Link href="#contacto">
              <button className="px-8 py-4 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors duration-300">
                Contactar
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* SHOWCASE DEL PERSONAJE (Derecha) */}
        <div className="relative flex justify-center items-center h-[500px] lg:h-[600px]">
          {/* Anillo de energía detrás */}
          <motion.div
            className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] border-2 border-dashed border-red-900/30 rounded-full z-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          {/* EFECTO DE RESPLANDOR CENTRAL (Sombra del LEGO) */}
          <div className="absolute w-[200px] h-[200px] bg-red-600/10 rounded-full blur-[80px] z-0"></div>

          {/* CONTENEDOR ANIMADO DEL LEGO */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Animación de flotación suave */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotateZ: [0, 1, -1, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* LA IMAGEN DEL LEGO */}
              <Image
                src="/lego-oc.webp"
                alt="Lego Original Character by Dani Rayo"
                width={650}
                height={650}
                priority // Carga esta imagen inmediatamente
                className="object-contain w-auto h-[450px] md:h-[600px] drop-shadow-[0_0_35px_rgba(255,0,0,0.2)] filter contrast-[1.05] brightness-[1.02]"
              />

              {/* EFECTO DE LÍNEA DE ESCANEO DIGITAL */}
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none h-1 w-full bg-cyan-400 opacity-40 blur-[2px]"
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
              />
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none h-px w-full bg-white opacity-60"
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Pequeños detalles decorativos UI */}
          <div className="absolute bottom-0 right-10 text-xs font-mono text-gray-700 bg-black/50 px-2 py-1 rounded border border-gray-800 z-30">
            MODEL: LEG0_OC_V1.3 // STATUS: RENDER_OK
          </div>
        </div>
      </div>

      {/* Degradado inferior para fusionar con la siguiente sección */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
    </section>
  );
}
