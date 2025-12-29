'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Grid, Sparkles, Html } from '@react-three/drei';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ActorRobot from '@/components/ActorRobot';
 // <--- NUEVO COMPONENTE

// --- COMPONENTE MARCADOR (Simple) ---
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

// --- ESCENA 3D PRINCIPAL ---
function Experience({ targetPosition, setTargetPosition }: { targetPosition: number, setTargetPosition: (n: number) => void }) {
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);

  // Mostrar marcador solo si el ratón está en un lado Y el robot en el otro
  const showLeftMarker = hoverSide === 'left' && targetPosition > 0;
  const showRightMarker = hoverSide === 'right' && targetPosition < 0;

  return (
    <>
      <color attach="background" args={['#050505']} />
      <Environment preset="city" /> 

      {/* Suelo y Partículas */}
      <Grid position={[0, -1.5, 0]} args={[60, 60]} cellSize={1} cellThickness={1} cellColor="#ff0000" sectionSize={5} sectionThickness={1.5} sectionColor="#aa0000" fadeDistance={40} />
      <Sparkles count={150} scale={20} size={3} speed={0.4} opacity={0.3} color="#ffffff" />

      {/* --- ZONAS DE DETECCIÓN INVISIBLES --- */}
      {/* Izquierda */}
      <mesh position={[-10, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={() => setHoverSide('left')} onClick={() => setTargetPosition(-4.5)}>
         <planeGeometry args={[20, 100]} />
         <meshBasicMaterial visible={false} />
      </mesh>
      {/* Derecha */}
      <mesh position={[10, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={() => setHoverSide('right')} onClick={() => setTargetPosition(4.5)}>
         <planeGeometry args={[20, 100]} />
         <meshBasicMaterial visible={false} />
      </mesh>

      {/* --- MARCADORES --- */}
      {showLeftMarker && <TargetIndicator position={[-4.5, -1.48, 0]} />}
      {showRightMarker && <TargetIndicator position={[4.5, -1.48, 0]} />}

      {/* --- ROBOT --- */}
      <Suspense fallback={<Html center><span className="text-cyan-500 font-mono animate-pulse">LOADING...</span></Html>}>
          <ActorRobot position={[-4.5, -1.5, 0]} targetPosition={targetPosition} scale={0.7} />
          <ContactShadows opacity={0.6} scale={10} blur={2.5} far={2} color="#000000" />
      </Suspense>

      {/* Luces */}
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
    <main className="w-full bg-black min-h-screen text-white selection:bg-cyan-500/30">
      
      {/* --- SECCIÓN HERO (3D + TÍTULO) --- */}
      {/* Ocupa el 100% de la altura de la ventana (h-screen) */}
      <section className="relative h-screen w-full overflow-hidden">
        
        {/* CAPA 3D */}
        <div className="absolute inset-0 z-10">
          <Canvas shadows camera={{ position: [0, 2, 10], fov: 35 }} gl={{ antialias: true }}>
            <Experience targetPosition={targetPos} setTargetPosition={setTargetPos} />
          </Canvas>
        </div>

        {/* CAPA UI */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center h-full text-center pointer-events-none select-none">
          
          <h1 className="glitch-text text-6xl md:text-9xl font-black text-white tracking-tighter leading-none mb-6 drop-shadow-2xl" data-text="DANIEL RAYO">
            DANIEL RAYO
          </h1>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
             className="text-cyan-400 font-bold text-sm md:text-xl tracking-[0.5em] bg-black/60 backdrop-blur-md px-8 py-3 border border-cyan-500/30 rounded-full shadow-lg uppercase"
          >
               3D Artist & Game Developer
          </motion.div>

          <div className="mt-20 pointer-events-auto">
            <Link href="#proyectos">
              <button className="relative group px-16 py-5 bg-black/50 border border-red-600 overflow-hidden hover:border-red-400 transition-all duration-300 backdrop-blur-sm">
                 <div className="absolute inset-0 bg-red-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <span className="relative z-10 text-white font-black text-xl tracking-[0.2em] flex items-center gap-3">
                   VER PROYECTOS <span className="text-red-500 group-hover:text-white transition-colors">►</span>
                 </span>
              </button>
            </Link>
          </div>
          
          <div className="absolute bottom-8 w-full text-center opacity-30">
               <p className="text-white text-[10px] font-mono tracking-[0.3em] animate-pulse">
                  [ CLICK ROBOT FOR MENU • SCROLL FOR MORE ]
               </p>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN ABOUT ME (DINÁMICA / EDITABLE) --- */}
      {/* Usamos el ID para que el botón 'Ver Proyectos' haga scroll hasta aquí */}
      <div id="proyectos">
        <AboutMe />
      </div>

      {/* --- ESTILOS GLOBALES --- */}
      <style jsx global>{`
        .glitch-text { position: relative; color: white; text-shadow: 4px 4px 0px rgba(0,0,0,1); }
        .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; }
        .glitch-text::before { left: 3px; text-shadow: -2px 0 #ff0000; clip-path: inset(44% 0 61% 0); animation: glitch-anim-1 3s infinite linear alternate-reverse; }
        .glitch-text::after { left: -3px; text-shadow: -2px 0 #00ffff; clip-path: inset(54% 0 21% 0); animation: glitch-anim-2 2.5s infinite linear alternate-reverse; }
        @keyframes glitch-anim-1 { 0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); } 20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); } 100% { clip-path: inset(30% 0 60% 0); transform: translate(1px, -1px); } }
        @keyframes glitch-anim-2 { 0% { clip-path: inset(10% 0 60% 0); transform: translate(1px, -1px); } 100% { clip-path: inset(40% 0 30% 0); transform: translate(-1px, 1px); } }
      `}</style>
    </main>
  );
}

// NECESARIO PARA COMPILACIÓN DE TYPESCRIPT
import * as THREE from 'three';
import AboutMe from '@/components/sections/AboutMe';
