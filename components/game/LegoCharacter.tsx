import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX, useAnimations, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import Ecctrl from "ecctrl"; // EL CONTROLADOR MÁGICO

interface LegoCharacterProps {
  position?: [number, number, number];
}

export default function LegoCharacter({ position = [0, 10, 0] }: LegoCharacterProps) {
  // --- CARGAR MODELO ---
  const group = useRef<THREE.Group>(null);
  const fbx = useFBX("/Lego Test.fbx");
  const { actions, names } = useAnimations(fbx.animations, group);

  // --- ARREGLO VISUAL (Centrar pies) ---
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(fbx);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const yOffset = -box.min.y;

    fbx.position.set(-center.x, yOffset, -center.z); // Centrar en local
    
    // Materiales
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
           mesh.material.roughness = 0.2;
           mesh.material.metalness = 0.0;
        }
      }
    });
  }, [fbx]);

  // --- GESTIÓN DE ANIMACIONES ---
  // Detectamos si se están pulsando teclas para cambiar animación
  const [, getKeys] = useKeyboardControls();
  const [animation, setAnimation] = useState("Idle");

  useFrame(() => {
    const { forward, backward, left, right, jump } = getKeys();
    const isMoving = forward || backward || left || right;
    
    // Lógica simple de estados
    if (jump) {
        // Si tuvieras animación de salto: setAnimation("Jump");
    } else if (isMoving) {
        setAnimation("Walk");
    } else {
        setAnimation("Idle");
    }
  });

  // Reproducir animación actual
  useEffect(() => {
    const idleAnim = names.find(n => n.toLowerCase().includes("idle")) || names[0];
    const walkAnim = names.find(n => n.toLowerCase().includes("walk") || n.toLowerCase().includes("run")) || names[1] || names[0];
    
    const actionName = animation === "Walk" ? walkAnim : idleAnim;
    const action = actions[actionName];

    if (action) {
        action.reset().fadeIn(0.2).play();
        return () => { action.fadeOut(0.2); };
    }
  }, [animation, actions, names]);

  return (
    // --- ECCTRL: CONTROLADOR DE VIDEOJUEGO ---
    // Capsula física + Cámara + Movimiento
    <Ecctrl 
      position={position}
      capsuleRadius={0.5}  // Tamaño del colisionador
      capsuleHalfHeight={0.5}
      camInitDis={-10}     // Distancia de cámara (Tercera persona)
      camMaxDis={-20}      // Máximo zoom out
      camMinDis={-2}       // Máximo zoom in
      maxVelLimit={6}      // Velocidad de correr
      jumpVel={5}          // Fuerza de salto
      autoBalance={true}   // Para que no se caiga
      debug={false}        // Pon true si quieres ver la cápsula de colisión
    >
      {/* El modelo visual va dentro */}
      <group ref={group} scale={0.015}>
        <primitive object={fbx} />
      </group>
    </Ecctrl>
  );
}