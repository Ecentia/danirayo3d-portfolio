import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface LegoCharacterProps {
  position?: [number, number, number];
  targetPosition: THREE.Vector3 | null;
  onReachTarget?: () => void;
}

// --- CONFIGURACIÓN DE FÍSICAS (Debe coincidir con LegoWorld) ---
const WATER_LEVEL = -2;
const noise = (x: number, z: number) => {
  const scale = 0.05;
  const h1 = Math.sin(x * scale) * Math.cos(z * scale) * 4;
  const h2 = Math.sin(x * scale * 3 + 10) * Math.cos(z * scale * 3 + 10) * 1;
  return Math.floor(h1 + h2);
};

export default function LegoCharacter({
  position = [0, 0, 0],
  targetPosition,
  onReachTarget,
}: LegoCharacterProps) {
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX("/Lego Test.fbx");
  const { actions, names } = useAnimations(fbx.animations, group);
  
  const [isMoving, setIsMoving] = useState(false);
  const currentPos = useRef(new THREE.Vector3(...position));
  const speed = 8.0; // Velocidad ajustada para recorrer el mapa gigante

  // --- 1. ARREGLO VISUAL DEL MODELO (Fix Definitivo) ---
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(fbx);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Calcular offset para que los pies (min.y) toquen el 0 local del grupo
    const yOffset = -box.min.y;

    // Aplicar al mesh interno (visual)
    fbx.position.y = yOffset;
    fbx.position.x = -center.x; 
    fbx.position.z = -center.z;

    // Materiales
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material instanceof THREE.MeshStandardMaterial) {
           child.material.roughness = 0.2;
           child.material.metalness = 0.0;
        }
      }
    });
  }, [fbx]);

  // --- 2. GESTIÓN DE ANIMACIONES ---
  useEffect(() => {
    const idleAnim = names.find((n) => n.toLowerCase().includes("idle")) || names[0];
    const walkAnim = names.find((n) => n.toLowerCase().includes("walk") || n.toLowerCase().includes("run")) || names[1] || names[0];
    
    if (!idleAnim) return; // Si no hay animaciones, abortar

    const currentAction = isMoving ? actions[walkAnim] : actions[idleAnim];
    currentAction?.reset().fadeIn(0.2).play();
    return () => { currentAction?.fadeOut(0.2); };
  }, [isMoving, actions, names]);

  // --- 3. BUCLE DE MOVIMIENTO Y GRAVEDAD ---
  useFrame((state, delta) => {
    if (!group.current) return;

    // A) MOVIMIENTO HORIZONTAL (X, Z)
    if (targetPosition) {
      const currentXZ = new THREE.Vector2(currentPos.current.x, currentPos.current.z);
      const targetXZ = new THREE.Vector2(targetPosition.x, targetPosition.z);
      const distance = currentXZ.distanceTo(targetXZ);

      if (distance > 0.1) {
        setIsMoving(true);

        const direction = new THREE.Vector2()
            .subVectors(targetXZ, currentXZ)
            .normalize();
        
        const moveStep = direction.multiplyScalar(speed * delta);
        currentPos.current.x += moveStep.x;
        currentPos.current.z += moveStep.y;

        // Rotación suave hacia el objetivo
        const lookTarget = new THREE.Vector3(targetPosition.x, group.current.position.y, targetPosition.z);
        const targetRotation = new THREE.Matrix4().lookAt(
          lookTarget,
          group.current.position,
          new THREE.Vector3(0, 1, 0)
        );
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetRotation);
        group.current.quaternion.slerp(targetQuaternion, 15 * delta);

      } else {
        if (isMoving) {
          setIsMoving(false);
          if (onReachTarget) onReachTarget();
        }
      }
    }

    // B) DETECCIÓN DE ALTURA (Y) - La clave para no flotar ni atravesar
    // Calculamos qué altura tiene el terreno bajo nuestros pies ahora mismo
    let terrainHeight = noise(Math.round(currentPos.current.x), Math.round(currentPos.current.z));
    
    // Lógica de Agua: No bajar del nivel del mar
    if (terrainHeight < WATER_LEVEL) terrainHeight = WATER_LEVEL;
    
    // Calculamos la posición Y destino. 
    // terrainHeight es el centro del bloque. Superficie = centro + 0.5.
    const targetY = terrainHeight + 0.5;

    // Aplicamos gravedad suave (Lerp) para subir/bajar escaleras con fluidez
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, 15 * delta);

    // Actualizamos la posición real del grupo
    group.current.position.copy(currentPos.current);
  });

  return (
    <group ref={group} dispose={null} scale={0.015}> 
      <primitive object={fbx} />
    </group>
  );
}