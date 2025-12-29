'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Grid, Sparkles, Html } from '@react-three/drei';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- COMPONENTES ---
import ActorRobot from '@/components/ActorRobot';
import AboutMe from '@/components/sections/AboutMe';
import ProjectsGrid from '@/components/sections/ProjectGrid';
import TechStack from '@/components/sections/TechStack';
import Experience from '@/components/sections/Experience';
import Contact from '@/components/sections/Contact';

// --- CONFIGURACIÓN DE ANIMACIONES REUTILIZABLES ---
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const revealSide = (direction: 'left' | 'right') => ({
  hidden: { opacity: 0, x: direction === 'left' ? -100 : 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 1, ease: "easeOut" }
  }
});

// --- ESCENA 3D PRINCIPAL ---
function ExperienceScene({ targetPosition, setTargetPosition }: { targetPosition: number, setTargetPosition: (n: number) => void }) {
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);

  return (
    <>
      <color attach="background" args={['#050505']} />
      <Environment preset="city" /> 

      <Grid position={[0, -1.5, 0]} args={[60, 60]} cellSize={1} cellThickness={1} cellColor="#ff0000" sectionSize={5} sectionThickness={1.5} sectionColor="#aa0000" fadeDistance={40} />
      <Sparkles count={150} scale={20} size={3} speed={0.4} opacity={0.3} color="#ffffff" />

      <mesh position={[-10, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={() => setHoverSide('left')} onClick={() => setTargetPosition(-4.5)}>
         <planeGeometry args={[20, 100]} />
         <meshBasicMaterial visible={false} />
      </mesh>
      <mesh position={[10, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={() => setHoverSide('right')} onClick={() => setTargetPosition(4.5)}>
         <planeGeometry args={[20, 100]} />
         <meshBasicMaterial visible={false} />
      </mesh>

      <Suspense fallback={<Html center><span className="text-red-600 font-mono animate-pulse tracking-widest uppercase">Initializing_System...</span></Html>}>
          <ActorRobot position={[-4.5, -1.5, 0]} targetPosition={targetPosition} scale={0.7} />
          <ContactShadows opacity={0.6} scale={10} blur={2.5} far={2} color="#000000" />
      </Suspense>

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" castShadow />
      <pointLight position={[-5, 2, -5]} intensity={5} color="#ff0000" />
      <pointLight position={[5, 2, 5]} intensity={5} color="#00aaff" />
    </>
  );
}

export default function Home() {
  const [targetPos, setTargetPos] = useState(-4.5); 

  return (
    <main className="w-full bg-black min-h-screen text-white selection:bg-red-500/30 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0 z-10">
          <Canvas shadows camera={{ position: [0, 2, 10], fov: 35 }} gl={{ antialias: true }}>
            <ExperienceScene targetPosition={targetPos} setTargetPosition={setTargetPos} />
          </Canvas>
        </div>

        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center h-full text-center pointer-events-none select-none px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="glitch-text text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-8 drop-shadow-2xl mix-blend-difference" 
            data-text="DANIEL RAYO"
          >
            DANIEL RAYO
          </motion.h1>

          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5, duration: 1 }}
             className="flex items-center gap-4"
          >
             <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-red-600"></div>
             <span className="text-red-500 font-bold text-xs md:text-lg tracking-[0.4em] uppercase">
               3D Artist & Game Developer
             </span>
             <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-red-600"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-24 pointer-events-auto"
          >
            <Link href="#proyectos" scroll={true}>
              <button className="relative group px-12 py-4 md:px-16 md:py-5 bg-black/20 border border-white/10 hover:border-red-600 overflow-hidden transition-all duration-500 backdrop-blur-sm rounded-sm">
                 <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                 <span className="relative z-10 text-white font-black text-sm md:text-xl tracking-[0.2em] flex items-center gap-3">
                   EXPLORAR <span className="text-red-600 group-hover:text-white transition-colors">↓</span>
                 </span>
              </button>
            </Link>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
      </section>

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
          variants={revealSide('left')}
        >
          <ProjectsGrid />
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
            variants={revealSide('right')}
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

      {/* ESTILOS GLOBALES EFECTO GLITCH */}
      <style jsx global>{`
        .glitch-text { position: relative; color: white; }
        .glitch-text::before, .glitch-text::after { 
            content: attr(data-text); 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: black; 
        }
        .glitch-text::before { 
            left: 2px; text-shadow: -1px 0 #ff0000; clip-path: inset(44% 0 61% 0); 
            animation: glitch-anim-1 4s infinite linear alternate-reverse; 
        }
        .glitch-text::after { 
            left: -2px; text-shadow: -1px 0 #00ffff; clip-path: inset(54% 0 21% 0); 
            animation: glitch-anim-2 3s infinite linear alternate-reverse; 
        }
        @keyframes glitch-anim-1 { 
            0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); } 
            20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); } 
            100% { clip-path: inset(30% 0 60% 0); transform: translate(1px, -1px); } 
        }
        @keyframes glitch-anim-2 { 
            0% { clip-path: inset(10% 0 60% 0); transform: translate(1px, -1px); } 
            100% { clip-path: inset(40% 0 30% 0); transform: translate(-1px, 1px); } 
        }
      `}</style>
    </main>
  );
}