"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  Sky, 
  Html,
  useProgress
  // Eliminamos 'Environment' para que no intente descargar nada
} from "@react-three/drei";
import * as THREE from "three";
import LegoCharacter from "./LegoCharacter";
import LegoWorld from "./LegoWorld";

// Componente de Pantalla de Carga
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/90 p-8 rounded-xl border-2 border-yellow-500 shadow-2xl backdrop-blur-md min-w-[300px]">
        <div className="text-4xl font-black italic text-yellow-400 mb-4 tracking-tighter">
          LOADING WORLD
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-white/20">
          <div 
            className="h-full bg-yellow-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between w-full mt-2 font-mono text-xs text-white/50">
          <span>INITIALIZING ASSETS...</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

export default function GameScene() {
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);

  const handleFloorClick = (point: THREE.Vector3) => {
    // Elevamos ligeramente el punto para evitar conflictos con el suelo
    const newTarget = new THREE.Vector3(point.x, point.y, point.z);
    setTargetPosition(newTarget);
  };

  return (
    // Fondo azul cielo suave
    <div id="canvas-container" className="w-full h-full bg-[#87ceeb]"> 
      <Canvas
        // Configuramos sombras nativas suaves (PCFSoft)
        shadows="soft"
        // Cámara isométrica alejada para ver el mapa grande
        camera={{ position: [50, 50, 50], fov: 30 }} 
        dpr={[1, 1.5]} // Limitamos DPR para rendimiento
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        {/* --- NIEBLA --- */}
        {/* Empieza a 50m y termina a 150m. Oculta el final del mapa sin cegar. */}
        <fog attach="fog" args={['#87ceeb', 50, 150]} />

        <Suspense fallback={<Loader />}>
          {/* 1. ATMÓSFERA */}
          <Sky 
            sunPosition={[100, 50, 100]} 
            turbidity={0.1} 
            rayleigh={0.5} 
            mieCoefficient={0.005} 
            mieDirectionalG={0.8} 
          />
          
          {/* 2. ILUMINACIÓN (100% Manual, sin descargas externas) */}
          
          {/* Luz Ambiental: Rellena las sombras para que no sean negras (Subida a 0.7 para compensar falta de HDRI) */}
          <ambientLight intensity={0.7} color="#ffffff" /> 
          
          {/* Luz Solar Principal */}
          <directionalLight 
            position={[50, 100, 50]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]} // Sombras nítidas
            shadow-bias={-0.0005} // Evita el "shadow acne"
          >
            {/* Área de sombras gigante para cubrir todo el mapa */}
            <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
          </directionalLight>

          {/* 3. MUNDO Y PERSONAJE */}
          <group> 
            <LegoWorld onFloorClick={handleFloorClick} />
            
            <LegoCharacter 
              position={[0, 10, 0]} 
              targetPosition={targetPosition} 
              onReachTarget={() => setTargetPosition(null)}
            />
          </group>

          {/* 4. CONTROLES */}
          <OrbitControls 
            enablePan={true} 
            maxPolarAngle={Math.PI / 2.2} 
            minDistance={20}
            maxDistance={100}
            target={[0, 0, 0]} 
            mouseButtons={{
              LEFT: 2, // Rotar con clic izquierdo (temporalmente, para probar)
              MIDDLE: 1, 
              RIGHT: 0 
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}