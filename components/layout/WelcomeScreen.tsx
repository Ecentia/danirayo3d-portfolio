'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Mensajes técnicos aleatorios para simular carga
const BOOT_LOGS = [
  "INITIALIZING KERNEL...",
  "LOADING ASSETS...",
  "COMPILING SHADERS 45%",
  "ESTABLISHING CONNECTION...",
  "DECRYPTING PROFILE...",
  "OPTIMIZING MESHES...",
  "RENDER ENGINE READY."
];

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(BOOT_LOGS[0]);

  // Lógica de visualización (Session Storage)
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('welcomeScreenShown');
    // Para probarlo siempre, comenta el if/check de session storage temporalmente
    if (!hasVisited) {
      setVisible(true);
      sessionStorage.setItem('welcomeScreenShown', 'true');
    }
  }, []);

  // Lógica de animación de carga y cierre
  useEffect(() => {
    if (!visible) return;

    document.body.style.overflow = 'hidden';

    // Simular barra de carga no lineal
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Aumentos aleatorios para parecer carga real
        const increment = Math.floor(Math.random() * 5) + 1; 
        const next = prev + increment;
        
        if (next > 100) return 100;
        
        // Cambiar logs basado en progreso
        const logIndex = Math.floor((next / 100) * (BOOT_LOGS.length - 1));
        setCurrentLog(BOOT_LOGS[logIndex]);
        
        return next;
      });
    }, 50);

    // Cerrar pantalla al finalizar
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = 'auto';
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden font-mono text-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* === CAPAS DE FONDO ATMOSFÉRICO === */}
        
        {/* 1. Grid Cyberpunk en el suelo (Perspectiva 3D simulada) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-red-900/20 to-transparent" />
          <div className="perspective-grid absolute inset-0" />
        </div>

        {/* 2. Efecto Scanlines (CRT TV) */}
        <div className="absolute inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <div className="scanlines absolute inset-0 pointer-events-none z-50 opacity-10" />

        {/* === CONTENIDO PRINCIPAL === */}

        {/* LOGO CON EFECTO DE RESPIRACIÓN */}
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12 }}
            className="relative mb-8"
        >
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
            <img
            src="/favicon.ico"
            alt="Logo"
            className="w-24 h-24 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
            />
        </motion.div>

        {/* NOMBRE (GLITCH MEJORADO) */}
        <div className="relative">
            <motion.h1
            className="glitch-text text-5xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500"
            data-text="DANIEL RAYO"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            >
            DANIEL RAYO
            </motion.h1>
            {/* Decoración tech a los lados */}
            <motion.div 
                initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.8, duration: 1 }}
                className="h-[1px] bg-red-500 w-full absolute -bottom-2 opacity-50" 
            />
        </div>

        {/* LOGS DE CONSOLA (Scroll de texto) */}
        <div className="mt-8 h-6 text-xs md:text-sm text-red-400 font-bold tracking-widest uppercase">
            <motion.span
                key={currentLog} // Key change fuerza la animación cada vez que cambia el texto
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                {`> ${currentLog}`}
            </motion.span>
        </div>

        {/* BARRA DE PROGRESO "GAME STYLE" */}
        <div className="mt-4 w-72 md:w-96 relative">
            {/* Fondo barra */}
            <div className="h-2 w-full bg-gray-900 border border-gray-800 relative overflow-hidden">
                {/* Relleno animado */}
                <motion.div
                    className="h-full bg-red-600 relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Brillo en la punta de la barra */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px]" />
                </motion.div>
                
                {/* Marcas de regla sobre la barra */}
                <div className="absolute inset-0 flex justify-between px-1">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-black/50" />
                    ))}
                </div>
            </div>

            {/* Contador numérico */}
            <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                <span>SYS.VER.2.0.4</span>
                <span className="text-white">{progress}%</span>
            </div>
        </div>

        {/* ESTILOS CSS PROPIOS PARA EFECTOS DE JUEGO */}
        <style jsx>{`
          .scanlines {
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(255,255,255,0) 50%,
              rgba(0,0,0,0.2) 50%,
              rgba(0,0,0,0.2)
            );
            background-size: 100% 4px;
            animation: scanlineMove 0.5s linear infinite;
          }

          .perspective-grid {
            background-size: 40px 40px;
            background-image:
              linear-gradient(to right, rgba(50, 50, 50, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(50, 50, 50, 0.3) 1px, transparent 1px);
            transform: perspective(500px) rotateX(60deg);
            transform-origin: bottom;
            animation: gridMove 2s linear infinite;
          }

          @keyframes scanlineMove {
            0% { background-position: 0 0; }
            100% { background-position: 0 4px; }
          }

          @keyframes gridMove {
            0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
            100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
          }

          /* GLITCH TEXT MEJORADO */
          .glitch-text {
            position: relative;
            text-shadow: 2px 2px 0px rgba(255, 0, 0, 0.3);
          }
          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #050505; /* Mismo color fondo */
          }
          .glitch-text::before {
            left: 2px;
            text-shadow: -1px 0 #ff0000;
            clip: rect(44px, 450px, 56px, 0);
            animation: glitch-anim 5s infinite linear alternate-reverse;
          }
          .glitch-text::after {
            left: -2px;
            text-shadow: -1px 0 #00ffff;
            clip: rect(44px, 450px, 56px, 0);
            animation: glitch-anim2 5s infinite linear alternate-reverse;
          }

          @keyframes glitch-anim {
            0% { clip: rect(12px, 9999px, 32px, 0); }
            5% { clip: rect(84px, 9999px, 99px, 0); }
            10% { clip: rect(6px, 9999px, 20px, 0); }
            /* Pausa larga para que sea legible */
            15% { clip: rect(900px, 0, 0, 0); } 
            100% { clip: rect(900px, 0, 0, 0); }
          }
          @keyframes glitch-anim2 {
            0% { clip: rect(65px, 9999px, 80px, 0); }
            5% { clip: rect(10px, 9999px, 15px, 0); }
            10% { clip: rect(90px, 9999px, 100px, 0); }
            /* Pausa larga */
            15% { clip: rect(900px, 0, 0, 0); } 
            100% { clip: rect(900px, 0, 0, 0); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}