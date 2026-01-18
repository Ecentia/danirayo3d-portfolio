import React, { useMemo } from "react";
import * as THREE from "three";
import { Instance, Instances } from "@react-three/drei";

interface LegoWorldProps {
  onFloorClick: (point: THREE.Vector3) => void;
}

// --- CONFIGURACIÓN DE LA GENERACIÓN ---
const MAP_SIZE = 96; // Tamaño equilibrado (96x96 = 9,216 columnas). Si ponemos más, puede bajar FPS.
const WATER_LEVEL = -1; // Nivel del mar
const BEDROCK_LEVEL = -5; // Profundidad de la tierra (para que no se vean huecos abajo)

// Geometrías compartidas (Optimizadas)
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const studGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 8);
studGeo.translate(0, 0.6, 0); // Stud elevado

export default function LegoWorld({ onFloorClick }: LegoWorldProps) {
  
  // Materiales de alta calidad (Colores vibrantes estilo Lego)
  const materials = useMemo(() => ({
    snow: new THREE.MeshStandardMaterial({ color: "#fffafa", roughness: 0.1, metalness: 0.1 }),
    stone: new THREE.MeshStandardMaterial({ color: "#9e9e9e", roughness: 0.6 }),
    grassTop: new THREE.MeshStandardMaterial({ color: "#2e7d32", roughness: 0.2 }), // Verde oscuro Lego
    dirt: new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.8 }), // Tierra marrón
    sand: new THREE.MeshStandardMaterial({ color: "#fbc02d", roughness: 0.4 }), // Arena amarilla
    water: new THREE.MeshStandardMaterial({ color: "#4fc3f7", roughness: 0.0, transparent: true, opacity: 0.7 }),
    wood: new THREE.MeshStandardMaterial({ color: "#3e2723", roughness: 0.7 }),
    leaves: new THREE.MeshStandardMaterial({ color: "#4caf50", roughness: 0.3 }), // Verde claro
    bedrock: new THREE.MeshStandardMaterial({ color: "#212121", roughness: 0.9 }),
  }), []);

  // --- ALGORITMO DE GENERACIÓN DE TERRENO ---
  const worldData = useMemo(() => {
    // Arrays para InstancedMesh (Mejor rendimiento que objetos individuales)
    const blocks = {
      grass: [] as any[],
      dirt: [] as any[],
      stone: [] as any[],
      sand: [] as any[],
      snow: [] as any[],
      water: [] as any[],
      wood: [] as any[],
      leaves: [] as any[],
      bedrock: [] as any[],
    };

    // Función de Ruido Fractal (Pseudo-Perlin)
    // Mezcla varias ondas para crear terreno natural irregular
    const getNoiseHeight = (x: number, z: number) => {
      // Onda 1: Grandes montañas (Baja frecuencia, alta amplitud)
      const y1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 6;
      // Onda 2: Colinas medianas
      const y2 = Math.sin(x * 0.1 + 10) * Math.cos(z * 0.15 + 10) * 3;
      // Onda 3: Detalle rugoso
      const y3 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.5;
      
      return Math.floor(y1 + y2 + y3);
    };

    // BUCLE PRINCIPAL DE GENERACIÓN (Columna por Columna)
    for (let x = -MAP_SIZE / 2; x < MAP_SIZE / 2; x++) {
      for (let z = -MAP_SIZE / 2; z < MAP_SIZE / 2; z++) {
        
        const height = getNoiseHeight(x, z);

        // 1. RELLENO DE AGUA (Si la altura es menor al nivel del mar)
        if (height < WATER_LEVEL) {
          // Ponemos agua en el nivel del mar
          blocks.water.push({ pos: [x, WATER_LEVEL, z] });
          // Rellenamos con arena el fondo marino (justo en la superficie del terreno)
          blocks.sand.push({ pos: [x, height, z] });
        }

        // 2. GENERACIÓN DE LA COLUMNA DE TIERRA (SÓLIDA)
        // Desde el fondo (Bedrock) hasta la superficie (Height)
        // Esto evita que se vea "hueco" o "blanco" si miras de lado.
        
        // Determinar qué bloque va en la superficie (Top Block)
        let surfaceType = 'grass';
        if (height < WATER_LEVEL) surfaceType = 'sand'; // Fondo marino
        else if (height === WATER_LEVEL) surfaceType = 'sand'; // Playa
        else if (height > 5) surfaceType = 'stone'; // Montaña alta
        else if (height > 8) surfaceType = 'snow'; // Pico nevado

        // Colocamos el bloque de superficie
        if (height >= WATER_LEVEL) { // Si no es submarino profundo
            if (surfaceType === 'grass') blocks.grass.push({ pos: [x, height, z] });
            else if (surfaceType === 'sand') blocks.sand.push({ pos: [x, height, z] });
            else if (surfaceType === 'stone') blocks.stone.push({ pos: [x, height, z] });
            else if (surfaceType === 'snow') blocks.snow.push({ pos: [x, height, z] });
        }

        // 3. RELLENO (DIRT/TIERRA)
        // Rellenamos desde abajo hasta justo debajo de la superficie para que sea sólido
        for (let y = BEDROCK_LEVEL; y < height; y++) {
            // Si está muy profundo, es piedra, si está cerca de la superficie, es tierra
            if (y < height - 3) {
                 blocks.stone.push({ pos: [x, y, z] });
            } else {
                 blocks.dirt.push({ pos: [x, y, z] });
            }
        }

        // 4. VEGETACIÓN (ÁRBOLES)
        // Solo en superficie de hierba y con probabilidad aleatoria
        if (surfaceType === 'grass' && height >= WATER_LEVEL) {
             // Probabilidad de árbol: 2%
             // Zona de exclusión: Centro del mapa (0,0) para que el personaje no nazca dentro de un tronco
             if (Math.random() > 0.98 && (Math.abs(x) > 3 || Math.abs(z) > 3)) {
                const treeHeight = Math.floor(Math.random() * 2) + 3; // 3 a 5 bloques
                
                // Tronco
                for (let h = 1; h <= treeHeight; h++) {
                    blocks.wood.push({ pos: [x, height + h, z] });
                }
                
                // Hojas (Copa simple)
                blocks.leaves.push({ pos: [x, height + treeHeight + 1, z] }); // Top
                blocks.leaves.push({ pos: [x+1, height + treeHeight, z] });
                blocks.leaves.push({ pos: [x-1, height + treeHeight, z] });
                blocks.leaves.push({ pos: [x, height + treeHeight, z+1] });
                blocks.leaves.push({ pos: [x, height + treeHeight, z-1] });
                
                // Hojas (Base ancha)
                if (Math.random() > 0.5) {
                    blocks.leaves.push({ pos: [x+1, height + treeHeight - 1, z+1] });
                    blocks.leaves.push({ pos: [x-1, height + treeHeight - 1, z-1] });
                    blocks.leaves.push({ pos: [x+1, height + treeHeight - 1, z-1] });
                    blocks.leaves.push({ pos: [x-1, height + treeHeight - 1, z+1] });
                }
             }
        }

      }
    }
    return blocks;
  }, []);

  return (
    <group>
      {/* --- PLANO DE COLISIÓN (INVISIBLE) ---
         Este plano es crucial. Cubre todo el mapa a la altura del nivel del mar.
         Calculamos la altura real en el evento onClick para decirle al personaje dónde ir.
      */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          const px = Math.round(e.point.x);
          const pz = Math.round(e.point.z);

          // RECALCULAMOS LA ALTURA EN EL CLIC (Misma lógica que al generar)
          // Esto asegura que si haces clic en una montaña, el target sea la cima, no la base.
          const y1 = Math.sin(px * 0.05) * Math.cos(pz * 0.05) * 6;
          const y2 = Math.sin(px * 0.1 + 10) * Math.cos(pz * 0.15 + 10) * 3;
          const y3 = Math.sin(px * 0.3) * Math.cos(pz * 0.3) * 0.5;
          let h = Math.floor(y1 + y2 + y3);

          if (h < WATER_LEVEL) h = WATER_LEVEL; // No caminar bajo el agua

          // El destino es la superficie del bloque (+0.5)
          onFloorClick(new THREE.Vector3(px, h + 0.5, pz));
        }}
      >
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
      </mesh>


      {/* --- RENDERIZADO DE BLOQUES (INSTANCED) --- */}
      
      {/* 1. SUELO (HIERBA) */}
      <Instances range={10000} geometry={boxGeo} material={materials.grassTop} castShadow receiveShadow>
        {worldData.grass.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>
      <Instances range={10000} geometry={studGeo} material={materials.grassTop} castShadow receiveShadow>
        {worldData.grass.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 2. TIERRA (DIRT - Relleno) */}
      <Instances range={15000} geometry={boxGeo} material={materials.dirt} castShadow receiveShadow>
        {worldData.dirt.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 3. PIEDRA (STONE) */}
      <Instances range={8000} geometry={boxGeo} material={materials.stone} castShadow receiveShadow>
        {worldData.stone.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>
      <Instances range={8000} geometry={studGeo} material={materials.stone} castShadow receiveShadow>
        {worldData.stone.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 4. ARENA (SAND) */}
      <Instances range={5000} geometry={boxGeo} material={materials.sand} castShadow receiveShadow>
        {worldData.sand.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>
      <Instances range={5000} geometry={studGeo} material={materials.sand} castShadow receiveShadow>
        {worldData.sand.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 5. NIEVE (SNOW) */}
      <Instances range={2000} geometry={boxGeo} material={materials.snow} castShadow receiveShadow>
        {worldData.snow.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>
      <Instances range={2000} geometry={studGeo} material={materials.snow} castShadow receiveShadow>
        {worldData.snow.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 6. AGUA (WATER - Transparente) */}
      <Instances range={8000} geometry={boxGeo} material={materials.water}>
        {worldData.water.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 7. MADERA (WOOD) */}
      <Instances range={3000} geometry={boxGeo} material={materials.wood} castShadow receiveShadow>
        {worldData.wood.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

      {/* 8. HOJAS (LEAVES) */}
      <Instances range={8000} geometry={boxGeo} material={materials.leaves} castShadow receiveShadow>
        {worldData.leaves.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>
      <Instances range={8000} geometry={studGeo} material={materials.leaves} castShadow receiveShadow>
        {worldData.leaves.map((d, i) => <Instance key={i} position={d.pos} />)}
      </Instances>

    </group>
  );
}