'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Grid, Sparkles, Html } from '@react-three/drei';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as THREE from 'three'; // Importación necesaria para Three.js

// --- TUS COMPONENTES ---
import ActorRobot from '@/components/ActorRobot';
import AboutMe from '@/components/sections/AboutMe';
import ProjectsGrid from '@/components/sections/ProjectGrid';
import TechStack from '@/components/sections/TechStack';
// <--- NUEVA IMPORTACIÓN

// --- COMPONENTE MARCADOR (Tu código original) ---
function TargetIndicator({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.8} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// --- ESCENA 3D PRINCIPAL (Tu código original) ---
function Experience({ targetPosition, setTargetPosition }: { targetPosition: number, setTargetPosition: (n: number) => void }) {
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);

  const showLeftMarker = hoverSide === 'left' && targetPosition > 0;
  const showRightMarker = hoverSide === 'right' && targetPosition < 0;

  return (
    <>
      <color attach="background" args={['#050505']} />
      <Environment preset="city" /> 

      <Grid position={[0, -1.5, 0]} args={[60, 60]} cellSize={1} cellThickness={1} cellColor="#ff0000" sectionSize={5} sectionThickness={1.5} sectionColor="#aa0000" fadeDistance={40} />
      <Sparkles count={150} scale={20} size={3} speed={0.4} opacity={0.3} color="#ffffff" />

      {/* Zonas de click */}
      <mesh position={[-10, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={() => setHoverSide('left')} onClick={() => setTargetPosition(-4.5)}>
         <planeGeometry args={[20, 100]} />
         <meshBasicMaterial visible={false} />
      </mesh>
      <mesh position={[10, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={() => setHoverSide('right')} onClick={() => setTargetPosition(4.5)}>
         <planeGeometry args={[20, 100]} />
         <meshBasicMaterial visible={false} />
      </mesh>

      {showLeftMarker && <TargetIndicator position={[-4.5, -1.48, 0]} />}
      {showRightMarker && <TargetIndicator position={[4.5, -1.48, 0]} />}

      <Suspense fallback={<Html center><span className="text-cyan-500 font-mono animate-pulse">LOADING SYSTEM...</span></Html>}>
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

// --- UI PRINCIPAL (HOME) ---
export default function Home() {
  const [targetPos, setTargetPos] = useState(-4.5); 

  return (
    <main className="w-full bg-black min-h-screen text-white selection:bg-red-500/30 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full">
        <div className="absolute inset-0 z-10">
          <Canvas shadows camera={{ position: [0, 2, 10], fov: 35 }} gl={{ antialias: true }}>
            <Experience targetPosition={targetPos} setTargetPosition={setTargetPos} />
          </Canvas>
        </div>

        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center h-full text-center pointer-events-none select-none px-4">
          <h1 className="glitch-text text-5xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-8 drop-shadow-2xl mix-blend-difference" data-text="DANIEL RAYO">
            DANIEL RAYO
          </h1>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="flex items-center gap-4"
          >
             <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-cyan-500"></div>
             <span className="text-cyan-400 font-bold text-xs md:text-lg tracking-[0.4em] uppercase">
               3D Artist & Developer
             </span>
             <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-cyan-500"></div>
          </motion.div>

          <div className="mt-24 pointer-events-auto">
            <Link href="#proyectos" scroll={true}>
              <button className="relative group px-12 py-4 md:px-16 md:py-5 bg-black/20 border border-red-600/50 hover:border-red-500 overflow-hidden transition-all duration-300 backdrop-blur-sm rounded-sm">
                 <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                 <span className="relative z-10 text-white font-bold text-sm md:text-xl tracking-[0.2em] flex items-center gap-3">
                   EXPLORAR <span className="text-red-500 group-hover:text-white transition-colors">↓</span>
                 </span>
              </button>
            </Link>
          </div>
        </div>
        
        {/* Decoración inferior Hero */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* 2. DIVISOR TECH */}
      <div className="relative w-full h-px bg-gray-900">
         <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-1 bg-red-600 blur-[2px]"></div>
      </div>

      {/* 3. ABOUT ME */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
      >
        <AboutMe />
      </motion.div>
      <TechStack />

      {/* 4. DIVISOR TECH 2 */}
      <div className="w-full py-10 flex justify-center items-center gap-4 opacity-30">
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-white"></div>
          <div className="w-2 h-2 rotate-45 border border-white"></div>
          <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-white"></div>
      </div>

      {/* 5. PROYECTOS (Rejilla nueva) */}
      <div id="proyectos" className="scroll-mt-20 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <ProjectsGrid />
        </motion.div>
      </div>

      {/* FOOTER SIMPLE */}
      <footer className="w-full py-8 bg-black border-t border-white/10 text-center text-gray-600 text-xs tracking-widest font-mono">
         <p>© {new Date().getFullYear()} DANIEL RAYO. SYSTEM ONLINE.</p>
      </footer>

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