import React, { useMemo } from "react";
import * as THREE from "three";
import { Instance, Instances } from "@react-three/drei";
import { InstancedRigidBodies, RigidBody } from "@react-three/rapier";

// --- AQUÍ ESTABA EL ERROR: Faltaba definir qué props acepta el componente ---
interface LegoWorldProps {
  onFloorClick?: (point: THREE.Vector3) => void; // Lo hacemos opcional (?) por si acaso
}

// --- CONFIGURACIÓN ---
const MAP_SIZE = 64; 
const WATER_LEVEL = -2;

// Geometrías
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const studGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 8);
studGeo.translate(0, 0.6, 0); 

// Añadimos las props a la función
export default function LegoWorld({ onFloorClick }: LegoWorldProps) {
  
  const materials = useMemo(() => ({
    snow: new THREE.MeshStandardMaterial({ color: "#fffafa", roughness: 0.1 }),
    stone: new THREE.MeshStandardMaterial({ color: "#9e9e9e", roughness: 0.6 }),
    grass: new THREE.MeshStandardMaterial({ color: "#2e7d32", roughness: 0.2 }),
    dirt: new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.8 }),
    sand: new THREE.MeshStandardMaterial({ color: "#fbc02d", roughness: 0.4 }),
    water: new THREE.MeshStandardMaterial({ color: "#4fc3f7", roughness: 0.1, transparent: true, opacity: 0.6 }),
    wood: new THREE.MeshStandardMaterial({ color: "#3e2723", roughness: 0.7 }),
    leaves: new THREE.MeshStandardMaterial({ color: "#4caf50", roughness: 0.3 }),
  }), []);

  const instances = useMemo(() => {
    const data = {
      grass: [] as any[], dirt: [] as any[], stone: [] as any[],
      sand: [] as any[], snow: [] as any[], wood: [] as any[], leaves: [] as any[]
    };

    const noise = (x: number, z: number) => {
      return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 4 + Math.sin(x * 0.3) * Math.cos(z * 0.3);
    };

    for (let x = -MAP_SIZE / 2; x < MAP_SIZE / 2; x++) {
      for (let z = -MAP_SIZE / 2; z < MAP_SIZE / 2; z++) {
        const h = Math.floor(noise(x, z));
        
        // Lógica de biomas simplificada para el ejemplo
        if (h < WATER_LEVEL) {
             data.sand.push({ key: `${x}-${z}`, position: [x, h, z], rotation: [0,0,0] });
        } else if (h === WATER_LEVEL) {
             data.sand.push({ key: `${x}-${z}`, position: [x, h, z], rotation: [0,0,0] });
        } else if (h > 4) {
             data.stone.push({ key: `${x}-${z}`, position: [x, h, z], rotation: [0,0,0] });
        } else {
             data.grass.push({ key: `${x}-${z}`, position: [x, h, z], rotation: [0,0,0] });
             if (h > -5) data.dirt.push({ key: `${x}-${z}-d`, position: [x, h-1, z], rotation: [0,0,0] });
             
             if (Math.random() > 0.98) {
                 for(let i=1; i<=3; i++) data.wood.push({ key: `t-${x}-${z}-${i}`, position: [x, h+i, z], rotation: [0,0,0] });
                 data.leaves.push({ key: `l-${x}-${z}`, position: [x, h+4, z], rotation: [0,0,0] });
             }
        }
      }
    }
    return data;
  }, []);

  return (
    <group>
      {/* HIERBA */}
      <InstancedRigidBodies instances={instances.grass} friction={1}>
        <Instances range={10000} geometry={boxGeo} material={materials.grass} castShadow receiveShadow>
          <group>
             <Instance /> 
             <mesh geometry={studGeo} material={materials.grass} />
          </group>
        </Instances>
      </InstancedRigidBodies>

      {/* PIEDRA */}
      <InstancedRigidBodies instances={instances.stone} friction={1}>
        <Instances range={5000} geometry={boxGeo} material={materials.stone} castShadow receiveShadow>
          <group>
             <Instance />
             <mesh geometry={studGeo} material={materials.stone} />
          </group>
        </Instances>
      </InstancedRigidBodies>

      {/* ARENA */}
      <InstancedRigidBodies instances={instances.sand} friction={1}>
        <Instances range={5000} geometry={boxGeo} material={materials.sand} castShadow receiveShadow>
          <group>
             <Instance />
             <mesh geometry={studGeo} material={materials.sand} />
          </group>
        </Instances>
      </InstancedRigidBodies>

      {/* MADERA */}
      <InstancedRigidBodies instances={instances.wood}>
        <Instances range={2000} geometry={boxGeo} material={materials.wood} castShadow receiveShadow>
           <Instance />
        </Instances>
      </InstancedRigidBodies>

      {/* AGUA */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, WATER_LEVEL - 0.2, 0]}>
         <mesh rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
            <meshStandardMaterial color="#4fc3f7" transparent opacity={0.6} roughness={0.1} />
         </mesh>
      </RigidBody>

      {/* SUELO BASE */}
      <RigidBody type="fixed" position={[0, -10, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[MAP_SIZE, 1, MAP_SIZE]} />
        </mesh>
      </RigidBody>

    </group>
  );
}