"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, Html, useProgress, KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier"; // Motor de Físicas
import * as THREE from "three";
import LegoCharacter from "./LegoCharacter";
import LegoWorld from "./LegoWorld";

// Mapa de Teclas (WASD + Espacio)
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/90 p-8 rounded-xl border-2 border-yellow-500 shadow-2xl backdrop-blur-md min-w-[300px]">
        <div className="text-4xl font-black italic text-yellow-400 mb-4 tracking-tighter">
          LOADING PHYSICS
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-white/20">
          <div className="h-full bg-yellow-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between w-full mt-2 font-mono text-xs text-white/50">
          <span>INITIALIZING...</span><span>{progress.toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

export default function GameScene() {
  return (
    <div id="canvas-container" className="w-full h-full bg-[#87ceeb]">
      <Canvas
        shadows
        camera={{ position: [0, 10, 10], fov: 45 }} // La cámara la controlará el personaje ahora
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={['#87ceeb', 40, 90]} />

        <Suspense fallback={<Loader />}>
          {/* 1. LUCES Y CIELO */}
          <Sky sunPosition={[100, 50, 100]} turbidity={0.1} rayleigh={0.5} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[50, 100, 50]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
            shadow-bias={-0.0005}
          >
            <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
          </directionalLight>

          {/* 2. MOTOR DE FÍSICAS (Rapier) */}
          {/* debug={true} te mostraría las cajas de colisión si quieres verlas */}
          <Physics gravity={[0, -15, 0]} timeStep="vary">
            
            {/* 3. CONTROLES DE TECLADO */}
            <KeyboardControls map={keyboardMap}>
              
              {/* Mundo Sólido (LegoWorld ya tiene RigidBodies) */}
              <LegoWorld />
              
              {/* Personaje Controlable (WASD) */}
              {/* Ya no necesitamos pasarle targetPosition ni clicks, él se mueve solo */}
              <LegoCharacter position={[0, 10, 0]} />

            </KeyboardControls>

          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}