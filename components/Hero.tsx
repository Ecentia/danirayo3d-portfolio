"use client";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
  Sphere,
  Stars,
  Torus,
  Html,
  Text,
  Billboard,
  Image,
} from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

// Importar los componentes de las secciones para cargarlos en los overlays
import AboutMe from "@/components/sections/AboutMe";
import ProjectsGrid from "@/components/sections/ProjectGrid";
import TechStack from "@/components/sections/TechStack";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import SketchfabGallery from "@/components/sections/SketchfabGallery";

// Nuevos imports para los proyectos en el aro
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/database";
import ProjectModal from "@/components/projects/ProjectModal";
import { useAdmin } from "@/context/AdminContext";

// --- COMPONENTE 3D: El "Casco/Orbe" Sci-Fi Central ---
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
      <group scale={1.4}> {/* Un pelín más pequeño (era 1.8) */}
        {/* Núcleo Central Rojo (El "Casco") */}
        <Sphere ref={mainRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#ff0000"
            emissive="#500000"
            metalness={0.9}
            roughness={0.1}
            distort={0.3}
            speed={1.5}
          />
        </Sphere>

        {/* Anillo de energía orbitando */}
        <Torus
          ref={ringRef}
          args={[1.4, 0.05, 16, 100]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#ff2e2e"
            emissive="#ff0000"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </Torus>

        {/* Luces internas */}
        <pointLight color="red" intensity={5} distance={3} />
      </group>
    </Float>
  );
}

// --- COMPONENTE 3D: Planeta Interactivo ---
interface PlanetProps {
  position: [number, number, number];
  targetId: string;
  label: string;
  color: string;
  emissive: string;
  planetType: "distorted" | "ringed" | "wireframe" | "moons" | "pulsing";
  onClickPlanet: (targetId: string) => void;
  activePlanet: string | null;
}

function InteractivePlanet({
  position,
  targetId,
  label,
  color,
  emissive,
  planetType,
  onClickPlanet,
  activePlanet,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const satelliteRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isZoomed = activePlanet === targetId;

  // Animaciones de rotación y traslación personalizadas por planeta
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speedMultiplier = hovered ? 2.5 : 1;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3 * speedMultiplier;
      meshRef.current.rotation.x = t * 0.1 * speedMultiplier;
    }

    if (ringRef.current) {
      // Si el planeta de proyectos está activo y en zoom, que rote a 0.11 para sincronizarse con las tarjetas
      const baseSpeed = (targetId === "projects" && isZoomed) ? 0.11 : 0.15;
      ringRef.current.rotation.z = t * baseSpeed * (isZoomed ? 1 : speedMultiplier);
    }

    if (satelliteRef.current) {
      satelliteRef.current.rotation.y = t * 0.6 * speedMultiplier;
    }

    if (planetType === "pulsing" && meshRef.current) {
      const scaleVal = 0.5 + Math.sin(t * 3.5) * 0.05 * speedMultiplier;
      meshRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClickPlanet(targetId);
  };

  // Los planetas interactivos son más grandes, y si están haciendo zoom crecen a 2.0 (o 4.2 para proyectos)
  const scale = isZoomed
    ? (targetId === "projects" ? 4.2 : 2.0)
    : (hovered ? 1.15 : 0.95);

  const planetGroup = (
    <group position={position} scale={scale}>
      {/* Zona invisible interactiva más grande para facilitar clic */}
      {!isZoomed && (
        <Sphere
          args={[0.8, 16, 16]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <meshBasicMaterial visible={false} />
        </Sphere>
      )}

      {/* 1. DISTORTED (About Me - Cyan) */}
      {planetType === "distorted" && (
        <Sphere ref={meshRef} args={[0.45, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={hovered ? 3.0 : 1.2}
            metalness={0.9}
            roughness={0.05}
            distort={0.4}
            speed={2.2}
          />
        </Sphere>
      )}

      {/* 2. RINGED (Projects - Yellow) */}
      {planetType === "ringed" && (
        <group>
          <Sphere ref={meshRef} args={[0.4, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={hovered ? 2.5 : 1.0}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
          <Torus ref={ringRef} args={[0.7, 0.03, 8, 48]} rotation={[Math.PI / 2.15, 0, 0]} renderOrder={1}>
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={hovered ? 3.0 : 1.5}
              toneMapped={false}
              depthWrite={false}
              transparent={true}
              opacity={0.99}
            />
          </Torus>
        </group>
      )}

      {/* 3. WIREFRAME (Tech Arsenal - Purple) */}
      {planetType === "wireframe" && (
        <group>
          <Sphere ref={meshRef} args={[0.35, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={hovered ? 1.8 : 0.6}
              metalness={0.95}
              roughness={0.05}
            />
          </Sphere>
          <Sphere args={[0.5, 12, 12]}>
            <meshStandardMaterial
              color={color}
              wireframe
              emissive={emissive}
              emissiveIntensity={hovered ? 2.5 : 1.0}
            />
          </Sphere>
        </group>
      )}

      {/* 4. MOONS (Career - Green) */}
      {planetType === "moons" && (
        <group>
          <Sphere ref={meshRef} args={[0.4, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={hovered ? 2.2 : 0.8}
              metalness={0.8}
              roughness={0.2}
            />
          </Sphere>
          <group ref={satelliteRef}>
            <Sphere position={[0.75, 0.2, 0]} args={[0.1, 16, 16]}>
              <meshStandardMaterial
                color="#ffffff"
                emissive={emissive}
                emissiveIntensity={hovered ? 2.5 : 1.0}
              />
            </Sphere>
            <Sphere position={[-0.75, -0.2, 0.2]} args={[0.07, 16, 16]}>
              <meshStandardMaterial
                color="#888888"
                emissive={color}
                emissiveIntensity={hovered ? 1.8 : 0.8}
              />
            </Sphere>
          </group>
        </group>
      )}

      {/* 5. PULSING (Contact - Coral/Red) */}
      {planetType === "pulsing" && (
        <Sphere ref={meshRef} args={[0.42, 32, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={hovered ? 3.5 : 1.5}
            metalness={0.7}
            roughness={0.3}
          />
        </Sphere>
      )}

      {/* ETIQUETA FLOTANTE CYBERPUNK EN INGLÉS (Sólo visible si no estamos en zoom) */}
      {!isZoomed && (
        <Html
          position={[0, 0.8, 0]}
          center
          style={{
            pointerEvents: "none",
            transition: "all 0.3s ease",
          }}
        >
          <div className="flex flex-col items-center justify-center font-mono select-none">
            <div
              className="w-[2px] transition-all duration-300"
              style={{
                background: `linear-gradient(to bottom, ${color}, transparent)`,
                height: hovered ? "40px" : "20px",
              }}
            />
            <div
              className={`bg-zinc-950/95 border-2 px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.95)] ${
                hovered ? "scale-110" : "scale-100"
              }`}
              style={{
                borderColor: color,
                boxShadow: hovered
                  ? `0 0 25px ${color}80, inset 0 0 10px ${color}30`
                  : `0 0 10px ${color}30`,
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
              <span
                className="text-white text-xs font-black uppercase tracking-[0.25em] transition-colors"
                style={{
                  textShadow: `0 0 8px ${color}80`,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );

  if (isZoomed) {
    return planetGroup;
  }

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      {planetGroup}
    </Float>
  );
}

// --- COMPONENTE 3D: Manejador de Cámara para Zoom ---
interface CameraManagerProps {
  activePlanet: string | null;
}

function CameraManager({ activePlanet }: CameraManagerProps) {
  const { camera } = useThree();

  useFrame((state) => {
    // Posición y mirada por defecto
    const targetPos = new THREE.Vector3(0, 0, 5);
    const targetLook = new THREE.Vector3(0, 0, 0);

    // Ajustar cámara para hacer zoom y encuadrar el planeta en el lateral izquierdo
    if (activePlanet === "about-me") {
      targetPos.set(-4.5 - 1.2, 1.8 + 0.3, -1.0 + 2.6); // px - 1.2, py + 0.3, pz + 2.6
      targetLook.set(-4.5 + 0.8, 1.8, -1.0); // Mirar a la derecha para dejar el planeta a la izquierda
    } else if (activePlanet === "projects") {
      targetPos.set(4.5, 1.8, 5.15); // Centrado y a la distancia adecuada para ver el aro
      targetLook.set(4.5, 1.8, -1.0); // Mirar directo al centro del planeta
    } else if (activePlanet === "tech-arsenal") {
      targetPos.set(-5.2 - 1.2, -1.2 + 0.3, 0.5 + 2.6);
      targetLook.set(-5.2 + 0.8, -1.2, 0.5);
    } else if (activePlanet === "career") {
      targetPos.set(5.2 - 1.2, -1.2 + 0.3, 0.5 + 2.6);
      targetLook.set(5.2 + 0.8, -1.2, 0.5);
    } else if (activePlanet === "contact") {
      targetPos.set(0 - 1.2, -3.2 + 0.3, 0.5 + 2.6);
      targetLook.set(0 + 0.8, -3.2, 0.5);
    }

    // Interpolación suave y cinematográfica (0.05 es ideal para evitar giros bruscos)
    camera.position.lerp(targetPos, 0.05);

    // Persistencia e interpolación del punto de mira
    if (!camera.userData.lookTarget) {
      camera.userData.lookTarget = new THREE.Vector3(0, 0, 0);
    }
    camera.userData.lookTarget.lerp(targetLook, 0.05);
    camera.lookAt(camera.userData.lookTarget);
  });

  return null;
}

// --- COMPONENTE 3D: Anillo de Proyectos Orbitando ---
interface ProjectRingProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

// --- FUNCIONES DE UTILIDAD PARA GEOMETRÍAS CON BORDES REDONDEADOS ---
function getRoundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  return shape;
}

function getBottomBannerShape(width: number, height: number, bannerHeight: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x, y + bannerHeight);
  shape.lineTo(x + width, y + bannerHeight);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  shape.lineTo(x, y + bannerHeight);
  return shape;
}

// --- COMPONENTE 3D: Tarjeta Individual de Proyecto con Oclusión ---
interface ProjectCardProps {
  project: Project;
  idx: number;
  N: number;
  onSelectProject: (id: string) => void;
  allProjects: Project[];
}

function ProjectCard({ project, idx, N, onSelectProject, allProjects }: ProjectCardProps) {
  const cardRef = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [projectIdx, setProjectIdx] = useState(idx);

  const theta = (idx / N) * 2 * Math.PI;
  const radius = 3.30; // Se alinea con el radio del aro exterior (3.30)
  const alpha = Math.PI / 2.15; // Inclinación de 83.7 grados
  const yOffset = 0.15; // Desplazamiento vertical constante más bajo

  // Pre-generar las formas 2D con esquinas redondeadas (tarjetas un pelín más grandes)
  const borderShape = getRoundedRectShape(1.40, 0.92, 0.08); // Marco un pelín más grande (1.40 x 0.92)
  const bannerShape = getBottomBannerShape(1.38, 0.90, 0.24, 0.07); // Banner inferior proporcional

  const currentScale = useRef(1.0);
  const lastPhiRef = useRef(theta);

  // Sincronizar el estado de projectIdx si cambian las listas
  useEffect(() => {
    setProjectIdx(idx);
  }, [idx, N]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const phi = theta + t * 0.11; // Velocidad de rotación aumentada a 0.11
    const normalizedPhi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Detección de cruce de meridiano trasero (detrás del planeta: 1.5 * Math.PI)
    const lastPhi = lastPhiRef.current;
    lastPhiRef.current = normalizedPhi;

    const crossed = lastPhi < 1.5 * Math.PI && normalizedPhi >= 1.5 * Math.PI;
    if (crossed && allProjects.length > N) {
      setProjectIdx((prevIdx) => (prevIdx + N) % allProjects.length);
    }

    // Calcular posición en el plano inclinado de manera global para evitar rotaciones de coordenadas raras
    const x = radius * Math.cos(phi);
    const y = (radius * Math.sin(phi)) * Math.cos(alpha) + yOffset;
    const z = (radius * Math.sin(phi)) * Math.sin(alpha);

    // Rotación suave alrededor del eje Y global (nunca se ponen de cabeza ni giran sobre sí mismas)
    const ry = Math.atan2(x, z) * 0.85;

    if (cardRef.current) {
      cardRef.current.position.set(x, y, z);
      cardRef.current.rotation.set(0, ry, 0);

      // Lerp suave para escala únicamente
      const targetScale = hovered ? 1.25 : 1.0;
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.1);
      cardRef.current.scale.setScalar(currentScale.current);
    }

    // Parpadeo del sensor del HUD
    if (dotRef.current) {
      dotRef.current.emissiveIntensity = 1.5 + Math.sin(t * 5.0) * 1.0;
    }
  });

  const currentProject = allProjects[projectIdx] || project;

  return (
    <group ref={cardRef}>
      {/* VISTA TRASERA: Placa y detalles cyber-mecánicos dorados */}
      <group position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
        {/* Placa base metálica oscura */}
        <mesh renderOrder={2}>
          <shapeGeometry args={[borderShape]} />
          <meshStandardMaterial
            color="#080808"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Anillo dorado exterior */}
        <mesh position={[0, 0, 0.001]} renderOrder={2}>
          <ringGeometry args={[0.22, 0.25, 32]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={hovered ? 2.5 : 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Núcleo dorado interior */}
        <mesh position={[0, 0, 0.001]} renderOrder={2}>
          <ringGeometry args={[0, 0.15, 32]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={hovered ? 3.0 : 1.2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Cruz del HUD de fondo */}
        <mesh position={[0, 0, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.6, 0.01]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={hovered ? 2.0 : 0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0, 0.001]} rotation={[0, 0, Math.PI / 2]} renderOrder={2}>
          <planeGeometry args={[0.6, 0.01]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={hovered ? 2.0 : 0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Esquinas decorativas metálicas */}
        <mesh position={[-0.59, 0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.59, 0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.59, -0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.59, -0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* VISTA FRONTAL: Marco, imagen, HUD y brillo de cristal */}
      
      {/* Marco Amarillo/Oro interactivo */}
      <mesh
        renderOrder={2}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectProject(currentProject.id);
        }}
      >
        <shapeGeometry args={[borderShape]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={hovered ? 2.5 : 0.6}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Imagen del proyecto */}
      {currentProject.thumbnail_url && (
        <Image
          url={currentProject.thumbnail_url}
          scale={[1.38, 0.90]}
          position={[0, 0, 0.01]}
          radius={0.07}
          renderOrder={2}
        />
      )}

      {/* Cristal Transparente Reflectante (Glassmorphism Overlay) */}
      <mesh position={[0, 0, 0.012]} renderOrder={2}>
        <shapeGeometry args={[borderShape]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0.15}
          metalness={0.8}
          transmission={0.4}
          thickness={0.05}
          ior={1.5}
        />
      </mesh>

      {/* HUD Detalle: Sensor parpadeante (Top-Left) */}
      <mesh position={[-0.63, 0.38, 0.015]} renderOrder={2}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshStandardMaterial
          ref={dotRef}
          color="#00f3ff"
          emissive="#00f3ff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* HUD Detalle: Nombre de la Categoría/Tag (Top-Left) */}
      <Text
        position={[-0.59, 0.38, 0.015]}
        fontSize={0.04}
        color="#ffcc00"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.004}
        outlineColor="#000000"
        renderOrder={2}
      >
        {currentProject.tags && currentProject.tags[0] ? currentProject.tags[0].toUpperCase() : "3D ART"}
      </Text>

      {/* HUD Detalle: Serial de Proyecto (Top-Right) */}
      <Text
        position={[0.59, 0.38, 0.015]}
        fontSize={0.04}
        color="#ffffff"
        anchorX="right"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.004}
        outlineColor="#000000"
        renderOrder={2}
      >
        {`[ PRJ - 0${projectIdx + 1} ]`}
      </Text>

      {/* Banner inferior semi-transparente para el título */}
      <mesh position={[0, 0, 0.016]} renderOrder={2}>
        <shapeGeometry args={[bannerShape]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>

      {/* Separador láser dorado */}
      <mesh position={[0, -0.22, 0.018]} renderOrder={2}>
        <planeGeometry args={[1.38, 0.012]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={hovered ? 2.0 : 0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Título del proyecto */}
      <Text
        position={[0, -0.34, 0.02]}
        fontSize={0.07}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
        textAlign="center"
        fontWeight="bold"
        outlineWidth={0.006}
        outlineColor="#000000"
        renderOrder={2}
      >
        {currentProject.title.toUpperCase()}
      </Text>
    </group>
  );
}

// --- COMPONENTE 3D: Satélite de Administrador para añadir proyectos ---
interface AdminSatelliteProps {
  onAddProject: () => void;
}

function AdminSatellite({ onAddProject }: AdminSatelliteProps) {
  const satelliteRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (satelliteRef.current) {
      // Orbita alrededor del planeta (plano XZ, entre el planeta y las tarjetas)
      const orbitRadius = 2.0;
      const speed = 0.55;
      const angle = t * speed;
      
      satelliteRef.current.position.x = orbitRadius * Math.cos(angle);
      satelliteRef.current.position.z = orbitRadius * Math.sin(angle);
      satelliteRef.current.position.y = Math.sin(t * 2.0) * 0.12; // Bobbing suave
      
      // Auto-rotación
      satelliteRef.current.rotation.y = t * 1.5;
      satelliteRef.current.rotation.x = t * 0.6;
    }
  });

  return (
    <group
      ref={satelliteRef}
      onClick={(e) => {
        e.stopPropagation();
        onAddProject();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Esfera del núcleo */}
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? "#00ffff" : "#ff0055"}
          emissive={hovered ? "#00ffff" : "#ff0055"}
          emissiveIntensity={hovered ? 3.0 : 1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Aro del satélite */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.24, 0.015, 8, 32]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={1.0}
          metalness={0.8}
        />
      </mesh>

      {/* Paneles solares */}
      <group rotation={[0, 0, Math.PI / 6]}>
        <mesh position={[-0.32, 0, 0]}>
          <boxGeometry args={[0.20, 0.06, 0.015]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0.32, 0, 0]}>
          <boxGeometry args={[0.20, 0.06, 0.015]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Luz focal local */}
      <pointLight
        color={hovered ? "#00ffff" : "#ff0055"}
        intensity={1.5}
        distance={2}
      />

      {/* Etiqueta flotante HUD satélite */}
      <Html
        position={[0, 0.45, 0]}
        center
        style={{
          pointerEvents: "none",
          transition: "all 0.3s ease",
        }}
      >
        <div className="flex flex-col items-center justify-center font-mono select-none">
          <div
            className="bg-zinc-950/95 border px-2.5 py-1.5 rounded flex items-center gap-1.5 whitespace-nowrap shadow-lg"
            style={{
              borderColor: hovered ? "#00ffff" : "#ff0055",
              boxShadow: hovered 
                ? "0 0 15px rgba(0,243,255,0.4)" 
                : "0 0 15px rgba(255,0,85,0.2)"
            }}
          >
            <span 
              className="text-[8px] font-black uppercase tracking-wider text-white"
              style={{
                color: hovered ? "#00ffff" : "#ffffff"
              }}
            >
              + ADD PROJECT
            </span>
          </div>
          <div 
            className="w-[1px] h-2 bg-gradient-to-b"
            style={{
              background: hovered 
                ? "linear-gradient(to bottom, #00ffff, transparent)" 
                : "linear-gradient(to bottom, #ff0055, transparent)"
            }}
          />
        </div>
      </Html>
    </group>
  );
}

function ProjectRing({ projects, onSelectProject }: ProjectRingProps) {
  const N = Math.min(projects.length, 6); // Limitar slots a un máximo de 6 para evitar saturar el aro

  return (
    <group>
      {projects.slice(0, N).map((project, idx) => (
        <ProjectCard
          key={project.id}
          project={project}
          idx={idx}
          N={N}
          onSelectProject={onSelectProject}
          allProjects={projects}
        />
      ))}
    </group>
  );
}

// --- COMPONENTE PRINCIPAL HERO ---
export default function Hero() {
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  // Estados para base de datos de proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAdmin();

  // Cargar proyectos al inicio
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) {
        setProjects(data);
      }
    };
    fetchProjects();
  }, []);

  // Bloquear el scroll de la página de fondo cuando hay un overlay abierto
  useEffect(() => {
    if (activePlanet && activePlanet !== "projects") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activePlanet]);

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
  const subtitleText = " 3D Artist".split(" s");

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-rayo-black perspective-1000">
      {/* --- ESCENA 3D DE FONDO --- */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 5, 12]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={2}
            color="#ff2e2e"
          />
           {/* El objeto 3D principal (Helmet) */}
          {activePlanet !== "projects" && <SciFiHelmet />}

          {/* Controlador de Zoom de Cámara */}
          <CameraManager activePlanet={activePlanet} />

          {/* Planetas accesos directos interactivos 3D (Más grandes y más separados) */}
          <InteractivePlanet
            position={[-4.5, 1.8, -1.0]}
            targetId="about-me"
            label="About Me"
            color="#00f3ff"
            emissive="#00b8d4"
            planetType="distorted"
            onClickPlanet={setActivePlanet}
            activePlanet={activePlanet}
          />
          
          {/* PLANETA DE PROYECTOS & SU ARO DE TARJETAS 3D */}
          <group position={[4.5, 1.8, -1.0]}>
            <InteractivePlanet
              position={[0, 0, 0]}
              targetId="projects"
              label="Projects"
              color="#ffcc00"
              emissive="#ff9100"
              planetType="ringed"
              onClickPlanet={setActivePlanet}
              activePlanet={activePlanet}
            />
            {activePlanet === "projects" && (
              <>
                <ProjectRing
                  projects={projects}
                  onSelectProject={(id) => {
                    setSelectedProjectId(id);
                    setIsModalOpen(true);
                  }}
                />
                {isAdmin && (
                  <AdminSatellite
                    onAddProject={() => {
                      setSelectedProjectId(null);
                      setIsModalOpen(true);
                    }}
                  />
                )}
              </>
            )}
          </group>

          <InteractivePlanet
            position={[-5.2, -1.2, 0.5]}
            targetId="tech-arsenal"
            label="Tech Arsenal"
            color="#b026ff"
            emissive="#8a00e6"
            planetType="wireframe"
            onClickPlanet={setActivePlanet}
            activePlanet={activePlanet}
          />
          <InteractivePlanet
            position={[5.2, -1.2, 0.5]}
            targetId="career"
            label="Career"
            color="#00ff66"
            emissive="#00c853"
            planetType="moons"
            onClickPlanet={setActivePlanet}
            activePlanet={activePlanet}
          />
          <InteractivePlanet
            position={[0, -3.2, 0.5]}
            targetId="contact"
            label="Contact"
            color="#ff3366"
            emissive="#ff0044"
            planetType="pulsing"
            onClickPlanet={setActivePlanet}
            activePlanet={activePlanet}
          />

          {/* Entorno y partículas */}
          <Environment preset="city" />
          <Stars
            radius={100}
            depth={50}
            count={2000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        </Canvas>
      </div>

      {/* Rejilla Retro superpuesta (Cyberpunk floor) */}
      <div className="cyber-grid-floor absolute inset-0 z-1 opacity-50 pointer-events-none"></div>

      {/* --- CONTENIDO UI PRINCIPAL (Se atenúa si un planeta está activo) --- */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-4 mix-blend-lighten transition-all duration-700 ${
          activePlanet ? "opacity-0 scale-90 blur-md pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Título Principal con Glitch Interactivo */}
        <motion.div
          onHoverStart={() => setIsHoveringTitle(true)}
          onHoverEnd={() => setIsHoveringTitle(false)}
          className="relative mb-6 cursor-default"
        >
          <h1
            className={`text-6xl md:text-9xl font-black text-white tracking-tighter relative z-10 transition-all duration-100 ${isHoveringTitle ? "glitch-active" : ""}`}
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
          className="text-white font-mono text-xl md:text-3xl flex overflow-hidden"
        >
          {subtitleText.map((char, index) => (
            <motion.span
              key={index}
              variants={letter}
              className={char === ">" ? "text-rayo-red mr-2 font-bold" : ""}
            >
              {char}
            </motion.span>
          ))}
        </motion.h2>
      </div>

      {/* --- TITULO DE LA SECCIÓN DE PROYECTOS (Top Center, estilo Cyberpunk HUD) --- */}
      {activePlanet === "projects" && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none font-mono flex flex-col items-center animate-fade-in">
          {/* Main HUD Container */}
          <div className="relative px-8 py-3 bg-zinc-950/80 border border-yellow-500/25 backdrop-blur-xl rounded-md flex flex-col items-center gap-1 shadow-[0_0_45px_rgba(0,0,0,0.9),0_0_15px_rgba(255,204,0,0.05)]">
            
            {/* Cyber Corner Decos */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-yellow-500/80 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-yellow-500/80 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-yellow-500/80 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-yellow-500/80 rounded-br-sm"></div>

            {/* Small Top Telemetry */}
            <div className="flex items-center gap-1.5 text-[8px] text-yellow-500/60 uppercase tracking-[0.25em] font-semibold mb-0.5">
              <span>SYSTEM: SEC_03</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
              <span>ALT: 320KM</span>
            </div>

            {/* Title text */}
            <h1 className="text-white text-lg md:text-xl font-black uppercase tracking-[0.45em] text-yellow-400 drop-shadow-[0_0_10px_rgba(255,204,0,0.4)]">
              PROJECTS ORBIT
            </h1>

            {/* Glowing Divider Line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent my-1"></div>

            {/* Sector status */}
            <div className="flex items-center gap-2 text-[9px] text-zinc-400 uppercase tracking-[0.15em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              <span>SYNCHRONIZED CONNECTION</span>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTÓN FLOTANTE VOLVER A LA ÓRBITA (Para Proyectos, estilo oro/amarillo) --- */}
      {activePlanet === "projects" && (
        <button
          onClick={() => setActivePlanet(null)}
          className="fixed top-6 right-6 z-50 px-5 py-2.5 border border-yellow-500/40 bg-zinc-950/80 rounded-md text-yellow-500 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,204,0,0.25)] hover:scale-105"
        >
          <span>✕</span> Return to Orbit
        </button>
      )}

      {/* --- PANEL DE DETALLE DE SECCIÓN (SIDEBAR DERECHO, EXCLUYE PROYECTOS) --- */}
      {activePlanet && activePlanet !== "projects" && (
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[60%] lg:w-[55%] z-40 bg-zinc-950/70 border-l border-zinc-800/30 backdrop-blur-lg overflow-y-auto custom-scrollbar flex flex-col animate-slide-left sidebar-content-wrapper select-text">
          {/* Botón flotante para regresar a la órbita general */}
          <button
            onClick={() => setActivePlanet(null)}
            className="sticky top-6 right-6 self-end mr-6 mt-6 z-50 px-5 py-2.5 border border-red-500/40 bg-zinc-950/80 rounded-md text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:scale-105"
          >
            <span>✕</span> Return to Orbit
          </button>

          {/* Envoltura del contenido dinámico */}
          <div className="w-full px-6 md:px-12 py-16 relative z-30 select-text">
            {activePlanet === "about-me" && (
              <div className="animate-slide-up">
                <AboutMe />
              </div>
            )}
            {activePlanet === "tech-arsenal" && (
              <div className="animate-slide-up">
                <TechStack />
              </div>
            )}
            {activePlanet === "career" && (
              <div className="animate-slide-up">
                <Experience />
              </div>
            )}
            {activePlanet === "contact" && (
              <div className="animate-slide-up">
                <Contact />
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLE DE PROYECTO (Estándar de la web) --- */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProjectId={selectedProjectId}
        allProjectsList={projects}
      />

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .cyber-grid-floor {
          background-image:
            linear-gradient(
              to right,
              rgba(255, 46, 46, 0.3) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 46, 46, 0.3) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
          transform: rotateX(70deg) translateY(150px);
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 10%,
            black 60%,
            transparent
          );
        }

        .drop-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 46, 46, 0.8);
        }
        .box-shadow-neon {
          box-shadow:
            0 0 20px rgba(255, 46, 46, 0.3),
            inset 0 0 10px rgba(255, 46, 46, 0.3);
        }

        /* Animaciones para Overlays */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-left {
          animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Overrides para adaptar componentes dentro del sidebar */
        :global(.sidebar-content-wrapper section) {
          background: transparent !important;
          background-image: none !important;
          padding-top: 1.5rem !important;
          padding-bottom: 1.5rem !important;
          border: none !important;
          box-shadow: none !important;
        }
        :global(.sidebar-content-wrapper section > .pointer-events-none),
        :global(.sidebar-content-wrapper section > div:first-of-type.pointer-events-none) {
          display: none !important;
        }
        :global(.sidebar-content-wrapper .max-w-7xl),
        :global(.sidebar-content-wrapper .max-w-6xl) {
          max-width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        /* Forzar visualización en una sola columna para rejillas de diseño */
        :global(.sidebar-content-wrapper .grid-cols-1.lg\:grid-cols-12) {
          grid-template-columns: 1fr !important;
          gap: 2rem !important;
        }
        :global(.sidebar-content-wrapper .lg\:col-span-5),
        :global(.sidebar-content-wrapper .lg\:col-span-7) {
          grid-column: span 1 / span 1 !important;
        }
        /* Forzar una sola columna para modelado Sketchfab */
        :global(.sidebar-content-wrapper .grid-cols-1.md\:grid-cols-2) {
          grid-template-columns: 1fr !important;
          gap: 2.5rem !important;
        }
        /* Forzar una sola columna para tarjetas de TechStack */
        :global(.sidebar-content-wrapper .grid-cols-1.sm\:grid-cols-2) {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        /* Forzar dos columnas para masonry en el sidebar en pantallas grandes */
        @media (min-width: 1024px) {
          :global(.sidebar-content-wrapper .flex.w-auto.-ml-6 > div) {
            width: 50% !important;
          }
        }
        @media (max-width: 1023px) {
          :global(.sidebar-content-wrapper .flex.w-auto.-ml-6 > div) {
            width: 100% !important;
          }
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
          0% {
            transform: skew(0deg);
          }
          20% {
            transform: skew(2deg);
          }
          40% {
            transform: skew(-2deg);
          }
          60% {
            transform: skew(1deg);
          }
          80% {
            transform: skew(-1deg);
          }
          100% {
            transform: skew(0deg);
          }
        }
        @keyframes glitch-anim-1 {
          0% {
            clip-path: inset(10% 0 80% 0);
            transform: translate(-4px, -2px);
          }
          50% {
            clip-path: inset(50% 0 20% 0);
            transform: translate(4px, 2px);
          }
          100% {
            clip-path: inset(80% 0 5% 0);
            transform: translate(-2px, 4px);
          }
        }
        @keyframes glitch-anim-2 {
          0% {
            clip-path: inset(5% 0 90% 0);
            transform: translate(4px, 2px);
          }
          50% {
            clip-path: inset(30% 0 40% 0);
            transform: translate(-4px, -2px);
          }
          100% {
            clip-path: inset(70% 0 10% 0);
            transform: translate(2px, -4px);
          }
        }
      `}</style>
    </section>
  );
}
