'use client';

import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import React, { useRef, useEffect, useState } from 'react';
import RobotMenu from '@/components/RobotMenu';

interface ActorRobotProps {
  targetPosition: number;
  scale?: number;
  [key: string]: any;
}

export default function ActorRobot({ targetPosition, ...props }: ActorRobotProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb');
  const { actions } = useAnimations(animations, group);

  // Estados
  const [phase, setPhase] = useState('wave'); 
  const [showMenu, setShowMenu] = useState(false);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  // 1. MATERIAL
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0066cc'),
          emissive: new THREE.Color('#001133'),
          roughness: 0.3,
          metalness: 0.8,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  // 2. DETECTOR DE MOVIMIENTO
  useEffect(() => {
    if (group.current) {
      const dist = Math.abs(targetPosition - group.current.position.x);
      if (dist > 0.5) {
        setShowMenu(false);
        setPhase('running');
      }
    }
  }, [targetPosition]);

  // 3. GESTOR DE ANIMACIONES
  useEffect(() => {
    const acts = {
      running: actions['Running'],
      idle: actions['Idle'],
      wave: actions['Wave'],
      jump: actions['Jump'],
      yes: actions['Yes']
    };

    const newAction = acts[phase as keyof typeof acts];
    
    if (newAction) {
      // Limpieza acción anterior
      if (currentAction.current && currentAction.current !== newAction) {
        if (currentAction.current === acts.running) {
            currentAction.current.stop(); 
        } else {
            currentAction.current.fadeOut(0.2);
        }
      }

      // Configurar nueva acción
      newAction.reset();
      newAction.fadeIn(0.2).play();

      if (phase === 'running') {
        newAction.timeScale = 1.5;
        newAction.setLoop(THREE.LoopRepeat, Infinity);
      } 
      else if (phase === 'idle') {
        newAction.timeScale = 1;
        newAction.setLoop(THREE.LoopRepeat, Infinity);
      } 
      else { 
        // Acciones puntuales
        newAction.setLoop(THREE.LoopOnce, 1);
        newAction.clampWhenFinished = true;
        
        const duration = newAction.getClip().duration * 1000;
        const timeout = setTimeout(() => setPhase('idle'), duration);
        return () => clearTimeout(timeout);
      }
      currentAction.current = newAction;
    }
  }, [phase, actions]);

  // 4. BUCLE FÍSICO (AQUÍ ESTÁ LA NUEVA LÓGICA DE MIRADA)
  useFrame((state, delta) => {
    if (!group.current) return;

    const currentX = group.current.position.x;
    const dist = Math.abs(targetPosition - currentX);
    const direction = targetPosition > currentX ? 1 : -1;

    // --- MODO CARRERA ---
    if (phase === 'running') {
      if (dist > 0.15) { 
        const speed = 9.0;
        group.current.position.x += direction * speed * delta;
        // Mirar hacia donde corre
        group.current.lookAt(targetPosition + (direction * 5), group.current.position.y, 0);
      } else {
        group.current.position.x = targetPosition; 
        group.current.rotation.y = 0;              
        setPhase('wave');                          
      }
    } 
    // --- MODO REPOSO / INTERACCIÓN ---
    else {
      // 1. ÁNGULO BASE: Mirar ligeramente hacia el centro de la pantalla
      // Si está a la derecha (>0), mira un poco a la izq (-0.4). Y viceversa.
      const baseAngle = targetPosition > 0 ? -0.4 : 0.4;

      // 2. LÓGICA CONDICIONAL: ¿Debe mirar al ratón?
      // Robot Derecha (>0) y Ratón Izquierda (<0) -> TRUE
      // Robot Izquierda (<0) y Ratón Derecha (>0) -> TRUE
      const isOppositeSide = (targetPosition > 0 && state.mouse.x < 0) || 
                             (targetPosition < 0 && state.mouse.x > 0);

      let mouseOffset = 0;
      let headTilt = 0;

      if (isOppositeSide) {
          // Si cumple la condición, calculamos el giro extra hacia el ratón
          mouseOffset = state.mouse.x * 0.6; // 0.6 es la intensidad del giro
          headTilt = -state.mouse.y * 0.1;   // Mirar arriba/abajo sutilmente
      } 
      // Si NO cumple (ratón en su mismo lado), mouseOffset se queda en 0 (ignorar)

      // 3. APLICAR ROTACIÓN SUAVE (LERP)
      // Usamos lerp para que la transición entre "mirarte" y "pasando de ti" sea fluida
      const targetY = baseAngle + mouseOffset;
      const targetX = headTilt;

      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.1);
    }
  });

  return (
    <group 
      ref={group} 
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <primitive object={scene} />

      {showMenu && (
        <Html position={[0, 2.3, 0]} center distanceFactor={12} zIndexRange={[100, 0]}>
          <RobotMenu 
            onClose={() => setShowMenu(false)}
            onAction={(action) => {
              setPhase(action);
              setShowMenu(false); // Cierra el menú al elegir acción
            }}
          />
        </Html>
      )}
    </group>
  );
}