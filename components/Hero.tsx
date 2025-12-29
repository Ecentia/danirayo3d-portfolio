"use client";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, Sphere, Stars, Torus } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

// --- COMPONENTE 3D: El "Casco/Orbe" Sci-Fi ---
function SciFiHelmet() {
  const mainRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mainRef.current) {
      mainRef.current.rotation.y = t * 0.2;
      mainRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.5;
      ringRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group scale={1.8}>
        {/* Núcleo Central Rojo (El "Casco") */}
        <Sphere ref={mainRef} args={[1, 64, 64]}>
           {/* Material metálico que se distorsiona */}
          <MeshDistortMaterial
            color="#ff0000"
            emissive="#500000"
            metalness={0.9}
            roughness={0.1}
            distort={0.3} // Intensidad de la distorsión
            speed={1.5}
          />
        </Sphere>
        
        {/* Anillo de energía orbitando */}
        <Torus ref={ringRef} args={[1.4, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#ff2e2e" emissive="#ff0000" emissiveIntensity={2} toneMapped={false} />
        </Torus>

        {/* Luces internas */}
        <pointLight color="red" intensity={5} distance={3} />
      </group>
    </Float>
  );
}

// --- COMPONENTE PRINCIPAL HERO ---
export default function Hero() {
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);

  // Variantes para animaciones de texto avanzadas
  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { delay: 0.5, staggerChildren: 0.08 },
    },
  };

  const letter = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const titleText = "DANIEL RAYO";
  const subtitleText = "> 3D Artist & Game Developer".split("");

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-rayo-black perspective-1000">
      
      {/* --- ESCENA 3D DE FONDO --- */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={['#050505', 5, 12]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#ff2e2e" />
          {/* El objeto 3D principal */}
          <SciFiHelmet />
          {/* Entorno y partículas */}
          <Environment preset="city" />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Rejilla Retro superpuesta (Cyberpunk floor) */}
      <div className="cyber-grid-floor absolute inset-0 z-1 opacity-50 pointer-events-none"></div>

      {/* --- CONTENIDO UI --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mix-blend-lighten">
        
        {/* Protocolo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-rayo-red font-mono text-sm tracking-[0.3em] mb-4 drop-shadow-glow"
        >
          / SYSTEM_READY // INITIALIZING...
        </motion.p>

        {/* Título Principal con Glitch Interactivo */}
        <motion.div
          onHoverStart={() => setIsHoveringTitle(true)}
          onHoverEnd={() => setIsHoveringTitle(false)}
          className="relative mb-6 cursor-default"
        >
          <h1 
            className={`text-6xl md:text-9xl font-black text-white tracking-tighter relative z-10 transition-all duration-100 ${isHoveringTitle ? 'glitch-active' : ''}`}
            data-text={titleText}
          >
            {titleText}
          </h1>
          {/* Sombra/Resplandor rojo detrás del texto */}
          <div className="absolute inset-0 blur-[30px] bg-rayo-red/40 z-0 rounded-full scale-y-50 scale-x-110"></div>
        </motion.div>

        {/* Subtítulo estilo Máquina de Escribir */}
        <motion.h2
          variants={sentence}
          initial="hidden"
          animate="visible"
          className="text-white font-mono text-xl md:text-3xl mb-12 flex overflow-hidden"
        >
          {subtitleText.map((char, index) => (
            <motion.span key={index} variants={letter} className={char === ">" ? "text-rayo-red mr-2 font-bold" : ""}>
              {char}
            </motion.span>
          ))}
        </motion.h2>

        {/* Botón Cyberpunk Animado */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="group relative px-12 py-5 bg-transparent overflow-hidden"
        >
           <div className="absolute inset-0 w-full h-full bg-rayo-red/10 border border-rayo-red skew-x-[-10deg] group-hover:bg-rayo-red/80 transition-all duration-300 box-shadow-neon"></div>
           <div className="absolute inset-0 w-2 h-full bg-rayo-red/50 blur-md -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 skew-x-[-20deg]"></div>
           <span className="relative z-10 text-rayo-red font-bold text-xl uppercase tracking-[0.2em] group-hover:text-white transition-colors">
             [ Enter Portfolio ]
           </span>
        </motion.button>
      </div>

      <style jsx>{`
        .perspective-1000 {
            perspective: 1000px;
        }
        .cyber-grid-floor {
          background-image: 
            linear-gradient(to right, rgba(255, 46, 46, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 46, 46, 0.3) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotateX(70deg) translateY(150px);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 60%, transparent);
        }
        
        .drop-shadow-glow {
            text-shadow: 0 0 10px rgba(255, 46, 46, 0.8);
        }
        .box-shadow-neon {
            box-shadow: 0 0 20px rgba(255, 46, 46, 0.3), inset 0 0 10px rgba(255, 46, 46, 0.3);
        }

        /* Glitch Effect Intenso al hacer Hover */
        .glitch-active {
          animation: glitch-skew 0.5s infinite linear alternate-reverse;
        }
        .glitch-active::before,
        .glitch-active::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        .glitch-active::before {
          color: #00ffff;
          z-index: -1;
          animation: glitch-anim-1 0.2s infinite linear alternate-reverse;
        }
        .glitch-active::after {
          color: #ff00ff;
          z-index: -2;
          animation: glitch-anim-2 0.2s infinite linear alternate-reverse;
        }

        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(2deg); }
          40% { transform: skew(-2deg); }
          60% { transform: skew(1deg); }
          80% { transform: skew(-1deg); }
          100% { transform: skew(0deg); }
        }
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(10% 0 80% 0); transform: translate(-4px, -2px); }
          50% { clip-path: inset(50% 0 20% 0); transform: translate(4px, 2px); }
          100% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 4px); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(5% 0 90% 0); transform: translate(4px, 2px); }
          50% { clip-path: inset(30% 0 40% 0); transform: translate(-4px, -2px); }
          100% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -4px); }
        }
      `}</style>
    </section>
  );
}