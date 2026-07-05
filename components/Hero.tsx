"use client";
import { motion, AnimatePresence } from "framer-motion";
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
  useTexture,
} from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { X, Database, Settings } from "lucide-react";

// Importar los componentes de las secciones para cargarlos en los overlays
import AboutMe from "@/components/sections/AboutMe";
import AboutMeHologram from "@/components/AboutMeHologram";
import TechStack, { ICON_MAP } from "@/components/sections/TechStack";
import ProjectsGrid from "@/components/sections/ProjectGrid";
import TechArsenalPanels from "@/components/TechArsenalPanels";
import CareerRing from "@/components/CareerRing";
import ContactPanels from "@/components/ContactPanels";

// Nuevos imports para los proyectos en el aro
import { supabase } from "@/lib/supabase";
import { Project, TechItem, ExperienceItem } from "@/types/database";
import ProjectModal from "@/components/projects/ProjectModal";
import ExperienceModal from "@/components/sections/ExperienceModal";
import { useAdmin, CURRENT_SLUG } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { SiArtstation, SiInstagram, SiLinkedin } from "react-icons/si";

const getTranslation = (value: string | null, isSpanish: boolean): string => {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return (isSpanish ? parsed.es : parsed.en) || parsed.en || parsed.es || value;
    }
  } catch (e) {}
  return value;
};

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

// Precarga la fuente de troika-three-text para evitar tirones al montar tarjetas 3D
function FontWarmup() {
  return (
    <Text visible={false} fontSize={0.01}>
      .
    </Text>
  );
}

function preloadImages(urls: string[]) {
  urls.forEach((url) => {
    if (!url) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
  });
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

  // Cargar texturas de los planetas
  const textures = useTexture({
    aboutMe: "/planets/about_me.webp",
    techStack: "/planets/tech_stack.webp",
  });

  // Ajustar escala y centrado para evitar el efecto zoom/deformación en la esfera
  useEffect(() => {
    const adjustTexture = (tex: THREE.Texture, scaleFactor: number) => {
      if (!tex) return;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(scaleFactor, scaleFactor);
      tex.offset.set((1 - scaleFactor) / 2, (1 - scaleFactor) / 2);
      tex.needsUpdate = true;
    };

    adjustTexture(textures.aboutMe, 1.85);
    adjustTexture(textures.techStack, 1.85);
  }, [textures]);

  // Animaciones de rotación y traslación personalizadas por planeta
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speedMultiplier = hovered ? 2.5 : 1;

    const isStaticPlanet = targetId === "about-me" || targetId === "tech-arsenal";

    if (meshRef.current && !isStaticPlanet) {
      meshRef.current.rotation.y = t * 0.3 * speedMultiplier;
      meshRef.current.rotation.x = t * 0.1 * speedMultiplier;
    } else if (meshRef.current && isStaticPlanet) {
      meshRef.current.rotation.y = 0;
      meshRef.current.rotation.x = 0;
    }

    if (ringRef.current) {
      // Si el planeta de proyectos está activo y en zoom, que rote a 0.11 para sincronizarse con las tarjetas
      const baseSpeed = (targetId === "projects" && isZoomed) ? 0.11 : 0.15;
      ringRef.current.rotation.z = t * baseSpeed * (isZoomed ? 1 : speedMultiplier);
    }

    if (satelliteRef.current) {
      if (planetType === "moons") {
        satelliteRef.current.rotation.x = t * 0.15 * speedMultiplier;
        satelliteRef.current.rotation.y = 0;
        satelliteRef.current.rotation.z = 0;
      } else {
        const satSpeed = planetType === "pulsing" ? 0.12 : 0.6;
        satelliteRef.current.rotation.y = t * satSpeed * speedMultiplier;
        satelliteRef.current.rotation.x = 0;
        satelliteRef.current.rotation.z = 0;
      }
    }

    if (planetType === "pulsing" && meshRef.current) {
      const scaleVal = 0.5 + Math.sin(t * 3.5) * 0.05 * speedMultiplier;
      meshRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (activePlanet && activePlanet === targetId) return;
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    if (activePlanet && activePlanet === targetId) return;
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (activePlanet && activePlanet === targetId) return;
    onClickPlanet(targetId);
  };

  // Los planetas interactivos son más grandes, y si están haciendo zoom crecen a 2.0 (o 4.2 para proyectos)
  const scale = isZoomed
    ? (targetId === "projects" ? 4.2 : (targetId === "career" ? 1.6 : 2.0))
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
          <meshStandardMaterial
            map={textures.aboutMe}
            emissive={emissive}
            emissiveIntensity={hovered ? 1.5 : 0.4}
            metalness={0.15}
            roughness={0.85}
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
              map={textures.techStack}
              emissive={emissive}
              emissiveIntensity={hovered ? 1.5 : 0.4}
              metalness={0.15}
              roughness={0.85}
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

      {/* 5. PULSING (Contact - Coral/Red Gyroscope Communication Array) */}
      {planetType === "pulsing" && (
        <group>
          {/* Núcleo Metálico Giratorio */}
          <Sphere ref={meshRef} args={[0.36, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={hovered ? 3.0 : 1.2}
              metalness={0.9}
              roughness={0.15}
            />
          </Sphere>

          {/* Anillo de Giroscopio 1 (Eje X/Z) */}
          <Torus ref={ringRef} args={[0.48, 0.012, 8, 48]} rotation={[Math.PI / 2.2, 0, 0]}>
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={hovered ? 4.0 : 2.0}
              toneMapped={false}
              transparent
              opacity={0.85}
            />
          </Torus>

          {/* Anillo de Giroscopio 2 (Eje Y/Z inclinado cruzado) */}
          <group ref={satelliteRef}>
            <Torus args={[0.58, 0.009, 8, 48]} rotation={[0.4, Math.PI / 4, 0.4]}>
              <meshStandardMaterial
                color="#ffffff"
                emissive={emissive}
                emissiveIntensity={hovered ? 2.5 : 1.0}
                toneMapped={false}
                transparent
                opacity={0.7}
              />
            </Torus>
          </group>
        </group>
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
      targetPos.set(-4.5, 1.50, 1.75); // Posición ajustada para evitar recorte izquierdo y mantener planeta azul y amarillo
      targetLook.set(-2.8, 1.35, -1.0); // Mirar un poco a la derecha para ver Projects en el fondo
    } else if (activePlanet === "projects") {
      targetPos.set(4.5, 1.8, 5.15); // Centrado y a la distancia adecuada para ver el aro
      targetLook.set(4.5, 1.8, -1.0); // Mirar directo al centro del planeta
    } else if (activePlanet === "tech-arsenal") {
      targetPos.set(-5.2, -1.0, 3.2); // Centrado en el planeta y alejado para ver los paneles a los lados
      targetLook.set(-5.2, -1.2, 0.5);
    } else if (activePlanet === "career") {
      targetPos.set(5.2, -1.0, 4.8);
      targetLook.set(5.2, -1.2, 0.5);
    } else if (activePlanet === "contact") {
      targetPos.set(0, -3.0, 3.2);
      targetLook.set(0, -3.2, 0.5);
    }

    // Interpolación suave y cinematográfica (0.08 es ideal para aproximación más rápida y fluida)
    camera.position.lerp(targetPos, 0.08);

    // Persistencia e interpolación del punto de mira
    if (!camera.userData.lookTarget) {
      camera.userData.lookTarget = new THREE.Vector3(0, 0, 0);
    }
    camera.userData.lookTarget.lerp(targetLook, 0.08);
    camera.lookAt(camera.userData.lookTarget);
  });

  return null;
}

// --- COMPONENTE 3D: Anillo de Proyectos Orbitando ---
interface ProjectRingProps {
  projects: Project[];
  isSpanish: boolean;
  orbitSpeedMultiplier: number;
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
  isSpanish: boolean;
  orbitSpeedMultiplier: number;
}

function ProjectCard({ project, idx, N, onSelectProject, allProjects, isSpanish, orbitSpeedMultiplier }: ProjectCardProps) {
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
    const phi = theta + t * 0.11 * orbitSpeedMultiplier; // Velocidad de rotación multiplicada por el selector
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
        {getTranslation(currentProject.title, isSpanish).toUpperCase()}
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

function ProjectRing({ projects, isSpanish, orbitSpeedMultiplier, onSelectProject }: ProjectRingProps) {
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
          isSpanish={isSpanish}
          orbitSpeedMultiplier={orbitSpeedMultiplier}
        />
      ))}
    </group>
  );
}

// --- COMPONENTE 3D: Satélites de Redes Sociales Orbitando ---
function SocialSatellites() {
  const sat1 = useRef<THREE.Group>(null);
  const sat2 = useRef<THREE.Group>(null);
  const sat3 = useRef<THREE.Group>(null);
  const satSettings = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState<string | null>(null);
  const { isAdmin } = useAdmin();

  // Posiciones fijas en las esquinas libres del espacio (con amplio margen respecto a los planetas)
  const pos1: [number, number, number] = [-5.2, 2.5, 0.5];  // ArtStation: Arriba a la izquierda
  const pos2: [number, number, number] = [3.8, -2.4, 0.5];  // Instagram: Abajo a la derecha
  const pos3: [number, number, number] = [5.2, 2.5, 0.5];   // LinkedIn: Arriba a la derecha
  const posSettings: [number, number, number] = [-3.8, -2.4, 0.5]; // Settings: Abajo a la izquierda

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Rotación sutil y wobble para simular estabilización orbital
    if (sat1.current) {
      sat1.current.position.y = pos1[1] + Math.sin(t * 1.2) * 0.08;
      sat1.current.rotation.y = t * 0.15;
      sat1.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
    if (sat2.current) {
      sat2.current.position.y = pos2[1] + Math.sin(t * 1.2 + 1.2) * 0.08;
      sat2.current.rotation.y = t * 0.12;
      sat2.current.rotation.z = Math.sin(t * 0.5 + 1.2) * 0.05;
    }
    if (sat3.current) {
      sat3.current.position.y = pos3[1] + Math.sin(t * 1.2 + 2.4) * 0.08;
      sat3.current.rotation.y = t * 0.18;
      sat3.current.rotation.z = Math.sin(t * 0.5 + 2.4) * 0.05;
    }
    if (satSettings.current) {
      satSettings.current.position.y = posSettings[1] + Math.sin(t * 1.2 + 3.6) * 0.08;
      satSettings.current.rotation.y = t * 0.14;
      satSettings.current.rotation.z = Math.sin(t * 0.5 + 3.6) * 0.05;
    }
  });

  const renderSatellite = (
    ref: React.RefObject<THREE.Group | null>,
    id: string,
    icon: React.ReactNode,
    link: string,
    label: string,
    color: string,
    initialPos: [number, number, number]
  ) => {
    const isHovered = hovered === id;

    return (
      <group
        ref={ref}
        position={initialPos}
        onClick={(e) => {
          e.stopPropagation();
          if (link.startsWith("/")) {
            window.location.href = link;
          } else {
            window.open(link, "_blank");
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(null);
          document.body.style.cursor = "auto";
        }}
      >
        {/* --- MODELO 3D DETALLADO DEL SATÉLITE --- */}
        <group scale={[1.3, 1.3, 1.3]}>
          {/* Cuerpo Central */}
          <mesh>
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <meshStandardMaterial
              color="#2a2b30"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>

          {/* Ala de Panel Solar Izquierdo */}
          <mesh position={[-0.24, 0, 0]}>
            <boxGeometry args={[0.26, 0.06, 0.015]} />
            <meshStandardMaterial
              color="#0055ff"
              emissive="#002288"
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Ala de Panel Solar Derecho */}
          <mesh position={[0.24, 0, 0]}>
            <boxGeometry args={[0.26, 0.06, 0.015]} />
            <meshStandardMaterial
              color="#0055ff"
              emissive="#002288"
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Soporte de la Antena Superior */}
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.06, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} />
          </mesh>

          {/* Antena Parabólica Superior */}
          <mesh position={[0, 0.12, 0]}>
            <coneGeometry args={[0.06, 0.03, 16]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Luz LED de Telemetría (Parpadea/Emite luz) */}
          <mesh position={[0, 0, 0.065]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={4.0}
            />
          </mesh>
        </group>

        <Html position={[0, 0.35, 0]} center distanceFactor={4.5}>
          <div
            className="flex flex-col items-center select-none font-mono pointer-events-auto cursor-pointer"
            onMouseEnter={() => {
              setHovered(id);
              document.body.style.cursor = "pointer";
            }}
            onMouseLeave={() => {
              setHovered(null);
              document.body.style.cursor = "auto";
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (link.startsWith("/")) {
                window.location.href = link;
              } else {
                window.open(link, "_blank");
              }
            }}
          >
            {/* Botón flotante estilo HUD */}
            <div className="relative group">
              {/* Brillo de fondo con color de red social */}
              <div 
                className="absolute inset-0 rounded-xl blur-[14px] opacity-30 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${color} 0%, transparent 75%)`
                }}
              />
              
              {/* Contenedor del Icono con esquinas Cyberpunk - Aumentado a w-20 h-20 */}
              <div
                className={`w-20 h-20 rounded-xl flex items-center justify-center border transition-all duration-300 backdrop-blur-xl shadow-2xl relative z-10 ${
                  isHovered ? "scale-115" : "scale-100"
                }`}
                style={{
                  backgroundColor: isHovered ? "rgba(10, 10, 12, 0.95)" : "rgba(10, 10, 12, 0.70)",
                  borderColor: isHovered ? color : "rgba(255, 255, 255, 0.15)",
                  color: isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                  boxShadow: isHovered ? `0 0 30px ${color}80` : "0 4px 15px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Esquinas decorativas del HUD */}
                <div 
                  className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l rounded-tl-sm transition-colors duration-300"
                  style={{ borderColor: isHovered ? color : "rgba(255, 255, 255, 0.3)" }}
                />
                <div 
                  className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r rounded-tr-sm transition-colors duration-300"
                  style={{ borderColor: isHovered ? color : "rgba(255, 255, 255, 0.3)" }}
                />
                <div 
                  className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l rounded-bl-sm transition-colors duration-300"
                  style={{ borderColor: isHovered ? color : "rgba(255, 255, 255, 0.3)" }}
                />
                <div 
                  className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r rounded-br-sm transition-colors duration-300"
                  style={{ borderColor: isHovered ? color : "rgba(255, 255, 255, 0.3)" }}
                />

                {icon}
              </div>
            </div>

          </div>
        </Html>
      </group>
    );
  };

  return (
    <group>
      {renderSatellite(
        sat1,
        "artstation",
        <SiArtstation size={38} />,
        "https://www.artstation.com/d_rayo3d/",
        "ArtStation",
        "#00f3ff", // Celeste/Cyan
        pos1
      )}
      {renderSatellite(
        sat2,
        "instagram",
        <SiInstagram size={38} />,
        "https://www.instagram.com/d_rayo.3d/",
        "Instagram",
        "#b026ff", // Morado neón
        pos2
      )}
      {renderSatellite(
        sat3,
        "linkedin",
        <SiLinkedin size={38} />,
        "https://www.linkedin.com/in/daniel-rodriguez-rayo-67a5132aa/",
        "LinkedIn",
        "#0077b5", // Azul LinkedIn
        pos3
      )}
      {isAdmin && renderSatellite(
        satSettings,
        "settings",
        <Settings size={38} />,
        "/admin/settings",
        "Settings",
        "#10b981", // Verde neón esmeralda para el panel admin
        posSettings
      )}
    </group>
  );
}

interface ProjectsMoonProps {
  position: [number, number, number];
  isSpanish: boolean;
  onClick: () => void;
}

function ProjectsMoon({ position, isSpanish, onClick }: ProjectsMoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = t * 0.1;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* Esfera de la Luna (aspecto rocoso y mate de luna) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : "#a1a1aa"}
          emissive={hovered ? "#ffffff" : "#1e1e24"}
          emissiveIntensity={hovered ? 2.0 : 0.5}
          roughness={0.95} // Aspecto mate y rocoso de luna
          metalness={0.05} // No metálico
        />
        {/* Cráter 1 */}
        <mesh position={[0.18, 0.18, 0.18]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#71717a" roughness={1.0} metalness={0.0} />
        </mesh>
        {/* Cráter 2 */}
        <mesh position={[-0.2, -0.1, 0.18]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#52525b" roughness={1.0} metalness={0.0} />
        </mesh>
        {/* Cráter 3 */}
        <mesh position={[0.0, -0.22, 0.18]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#71717a" roughness={1.0} metalness={0.0} />
        </mesh>
      </mesh>

      {/* Etiqueta 3D interactiva */}
      <Billboard position={[0, 0.48, 0]}>
        <Text
          fontSize={0.08}
          color="#ffffff"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#000000"
        >
          {isSpanish ? "VER GALERÍA" : "VIEW GALLERY"}
        </Text>
      </Billboard>
    </group>
  );
}

// --- COMPONENTE PRINCIPAL HERO ---
export default function Hero() {
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const { isSpanish } = useLanguage();
  const aboutMeX = activePlanet === "career" ? -2.2 : (activePlanet === "about-me" ? -1.9 : -2.8);
  const aboutMeY = activePlanet === "tech-arsenal" ? 0.8 : 1.35;
  const contactX = activePlanet === "tech-arsenal" ? -1.6 : 0;
  const techArsenalPos: [number, number, number] = activePlanet === "about-me"
    ? [-5.4, 0.32, -0.6]
    : [-5.2, -1.2, 0.5];
  const techArsenalScale = activePlanet === "about-me" ? 0.35 : 1.0;
  const [showSidebar, setShowSidebar] = useState(false);

  // Estados para base de datos de proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsReady, setProjectsReady] = useState(false);
  const [orbitWarmed, setOrbitWarmed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAllProjectsGrid, setShowAllProjectsGrid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin, deleteItem, notify } = useAdmin();

  // Estados para base de datos de tecnología (Tech Stack)
  const [techList, setTechList] = useState<TechItem[]>([]);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [techFormData, setTechFormData] = useState({ name: '', category: '3D & TEXTURING', icon_key: 'SiBlender' });

  const fetchTech = async () => {
    const { data } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('client_slug', CURRENT_SLUG)
      .order('display_order', { ascending: true });
    if (data) setTechList(data);
  };

  useEffect(() => {
    fetchTech();
  }, []);

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techFormData.name) return;
    const { error } = await supabase.from('tech_stack').insert([{
      ...techFormData,
      client_slug: CURRENT_SLUG,
      display_order: techList.length
    }]);
    
    if (error) {
        notify("Error al añadir: " + error.message, "error");
    } else {
        notify("Software añadido", "success");
        setIsTechModalOpen(false);
        setTechFormData({ name: '', category: '3D & TEXTURING', icon_key: 'SiBlender' });
        fetchTech();
    }
  };

  const handleDeleteTech = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este programa?")) {
      await deleteItem('tech_stack', id);
      fetchTech();
    }
  };

  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState(1.0);
  // Estados para base de datos de trayectoria (Career Timeline)
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

  const fetchExperience = async () => {
    const { data } = await supabase
      .from('experience')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setExperienceList(data);
  };

  useEffect(() => {
    fetchExperience();
  }, [isAdmin]);

  const handleDeleteExperience = async (id: string) => {
    if (confirm(isSpanish ? "¿Seguro que deseas eliminar este registro de experiencia?" : "Are you sure you want to delete this experience record?")) {
      await deleteItem('experience', id);
      fetchExperience();
    }
  };

  // Cargar proyectos y precargar thumbnails en segundo plano
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) {
        setProjects(data);
        preloadImages(
          data.slice(0, 6).map((project) => project.thumbnail_url ?? ""),
        );
        setProjectsReady(true);
      }
    };
    fetchProjects();
  }, []);

  // Precargar foto del holograma About Me
  useEffect(() => {
    preloadImages(["/daniel_rayo.jfif"]);
  }, []);

  // Dar un par de frames al aro 3D pre-montado antes de revelar la UI de proyectos
  useEffect(() => {
    if (!projectsReady) {
      setOrbitWarmed(false);
      return;
    }
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setOrbitWarmed(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [projectsReady]);

  // Controlar la transición y delay para mostrar el sidebar
  useEffect(() => {
    if (activePlanet && activePlanet !== "projects" && activePlanet !== "tech-arsenal") {
      const timer = setTimeout(() => {
        setShowSidebar(true);
      }, 400); // Alineado con el zoom de cámara
      return () => clearTimeout(timer);
    } else {
      setShowSidebar(false);
    }
  }, [activePlanet]);

  // Bloquear el scroll de la página de fondo cuando hay un overlay abierto
  useEffect(() => {
    if (activePlanet && activePlanet !== "projects" && activePlanet !== "tech-arsenal") {
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
  const subtitleText = (isSpanish ? "> Artista 3D" : "> 3D Artist").split("");

  const showProjectsUI =
    activePlanet === "projects" && projectsReady && orbitWarmed;
  const dimMainUI =
    activePlanet === "projects"
      ? showProjectsUI
      : activePlanet === "tech-arsenal"
      ? true
      : Boolean(activePlanet && showSidebar);

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-rayo-black perspective-1000">
      {/* --- ESCENA 3D DE FONDO --- */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5] }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 5, 12]} />
          <Suspense fallback={null}>
            <FontWarmup />
          </Suspense>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={2}
            color="#ff2e2e"
          />
          {/* El objeto 3D principal (Helmet) — se oculta solo cuando el contenido del planeta ya está listo */}
          {!showProjectsUI && activePlanet !== "about-me" && activePlanet !== "contact" && activePlanet !== "career" && activePlanet !== "tech-arsenal" && <SciFiHelmet />}

          {/* Controlador de Zoom de Cámara */}
          <CameraManager activePlanet={activePlanet} />

          {/* Planetas accesos directos interactivos 3D (Más grandes y más separados) */}
          <InteractivePlanet
            position={[aboutMeX, aboutMeY, -1.0]}
            targetId="about-me"
            label={isSpanish ? "Sobre Mí" : "About Me"}
            color="#00f3ff"
            emissive="#00b8d4"
            planetType="distorted"
            onClickPlanet={setActivePlanet}
            activePlanet={activePlanet}
          />

          {/* Holograma About Me pre-montado para evitar tirón en el primer clic */}
          <group position={[aboutMeX - 2.0, aboutMeY, -1.0]} visible={activePlanet === "about-me"}>
            <AboutMeHologram onClose={() => setActivePlanet(null)} isSpanish={isSpanish} />
          </group>
          
          {/* PLANETA DE PROYECTOS & SU ARO DE TARJETAS 3D */}
          {activePlanet !== "career" && (
            <group position={[4.5, 1.8, -1.0]}>
              <InteractivePlanet
                position={[0, 0, 0]}
                targetId="projects"
                label={isSpanish ? "Proyectos" : "Projects"}
                color="#ffcc00"
                emissive="#ff9100"
                planetType="ringed"
                onClickPlanet={setActivePlanet}
                activePlanet={activePlanet}
              />
              {projectsReady && (
                <group visible={activePlanet === "projects"}>
                  <ProjectRing
                    projects={projects}
                    isSpanish={isSpanish}
                    orbitSpeedMultiplier={orbitSpeedMultiplier}
                    onSelectProject={(id) => {
                      setSelectedProjectId(id);
                      setIsModalOpen(true);
                    }}
                  />
                  <ProjectsMoon
                    position={[4.4, 1.6, -0.2]}
                    isSpanish={isSpanish}
                    onClick={() => setShowAllProjectsGrid(true)}
                  />
                  {isAdmin && activePlanet === "projects" && (
                    <AdminSatellite
                      onAddProject={() => {
                        setSelectedProjectId(null);
                        setIsModalOpen(true);
                      }}
                    />
                  )}
                </group>
              )}
            </group>
          )}

          <group position={techArsenalPos} scale={techArsenalScale}>
            <InteractivePlanet
              position={[0, 0, 0]}
              targetId="tech-arsenal"
              label="Tech Arsenal"
              color="#b026ff"
              emissive="#8a00e6"
              planetType="wireframe"
              onClickPlanet={setActivePlanet}
              activePlanet={activePlanet}
            />
            {activePlanet === "tech-arsenal" && (
              <Suspense fallback={null}>
                <TechArsenalPanels
                  techList={techList}
                  isSpanish={isSpanish}
                  openAddModal={(category) => {
                    setTechFormData((prev) => ({ ...prev, category }));
                    setIsTechModalOpen(true);
                  }}
                  onDelete={handleDeleteTech}
                />
              </Suspense>
            )}
          </group>
          {activePlanet !== "about-me" && (
            <group position={[5.2, -1.2, 0.5]}>
              <InteractivePlanet
                position={[0, 0, 0]}
                targetId="career"
                label={isSpanish ? "Experiencia" : "Career"}
                color="#00ff66"
                emissive="#00c853"
                planetType="moons"
                onClickPlanet={setActivePlanet}
                activePlanet={activePlanet}
              />
              {activePlanet === "career" && (
                <Suspense fallback={null}>
                  <CareerRing
                    experienceList={experienceList}
                    isAdmin={isAdmin}
                    isSpanish={isSpanish}
                    onEdit={(item) => {
                      setEditingExperience(item);
                      setIsExperienceModalOpen(true);
                    }}
                    onDelete={handleDeleteExperience}
                  />
                </Suspense>
              )}
            </group>
          )}
          {activePlanet !== "about-me" && (
            <group position={[contactX, -3.2, 0.5]}>
              <InteractivePlanet
                position={[0, 0, 0]}
                targetId="contact"
                label={isSpanish ? "Contacto" : "Contact"}
                color="#ff3366"
                emissive="#ff0044"
                planetType="pulsing"
                onClickPlanet={setActivePlanet}
                activePlanet={activePlanet}
              />
              {activePlanet === "contact" && (
                <Suspense fallback={null}>
                  <ContactPanels isSpanish={isSpanish} />
                </Suspense>
              )}
            </group>
          )}

          {/* Entorno y partículas */}
          <Suspense fallback={null}>
            <Environment preset="city" />
          </Suspense>
          <Stars
            radius={100}
            depth={50}
            count={1200}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          {activePlanet === null && <SocialSatellites />}
        </Canvas>
      </div>

      {/* Rejilla Retro superpuesta (Cyberpunk floor) */}
      <div className="cyber-grid-floor absolute inset-0 z-1 opacity-50 pointer-events-none"></div>

      {/* --- CONTENIDO UI PRINCIPAL (Se atenúa si un planeta está activo) --- */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-4 mix-blend-lighten transition-all duration-700 ${
          dimMainUI ? "opacity-0 scale-90 blur-md pointer-events-none" : "opacity-100 scale-100"
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
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h2>
      </div>

      {/* --- TITULO DE LA SECCIÓN DE PROYECTOS (Top Center, estilo Cyberpunk HUD) --- */}
      {showProjectsUI && (
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
              {isSpanish ? "ÓRBITA DE PROYECTOS" : "PROJECTS ORBIT"}
            </h1>

            {/* Speed Selector HUD */}
            <div className="flex items-center gap-2 mt-3 pointer-events-auto text-[9px] font-mono text-yellow-500/80">
              <span className="tracking-widest uppercase font-bold">{isSpanish ? "VELOCIDAD DE GIRO:" : "ORBIT SPEED:"}</span>
              <div className="flex items-center gap-1">
                {[0.2, 0.5, 1.0, 2.0, 4.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => setOrbitSpeedMultiplier(val)}
                    className={`px-2 py-0.5 border text-[9px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                      orbitSpeedMultiplier === val
                        ? "border-yellow-400 bg-yellow-500/20 text-yellow-400 shadow-[0_0_8px_rgba(255,204,0,0.2)]"
                        : "border-yellow-500/10 text-yellow-500/40 hover:border-yellow-500/30 hover:text-yellow-500/60"
                    }`}
                  >
                    {val === 0.2 ? "SLOW" : `${val}X`}
                  </button>
                ))}
              </div>
            </div>


          </div>
        </div>
      )}

      {/* --- TITULO DE LA SECCIÓN DE TECH ARSENAL (Top Center, estilo Cyberpunk HUD Morado) --- */}
      {activePlanet === "tech-arsenal" && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none font-mono flex flex-col items-center animate-fade-in">
          {/* Main HUD Container */}
          <div className="relative px-8 py-3 bg-zinc-950/80 border border-purple-500/25 backdrop-blur-xl rounded-md flex flex-col items-center gap-1 shadow-[0_0_45px_rgba(0,0,0,0.9),0_0_15px_rgba(176,38,255,0.05)]">
            
            {/* Cyber Corner Decos */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-purple-500/80 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-500/80 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-500/80 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-purple-500/80 rounded-br-sm"></div>

            {/* Small Top Telemetry */}
            <div className="flex items-center gap-1.5 text-[8px] text-purple-500/60 uppercase tracking-[0.25em] font-semibold mb-0.5">
              <span>SYSTEM: SEC_04</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
              <span>ALT: 450KM</span>
            </div>

            {/* Title text */}
            <h1 className="text-white text-lg md:text-xl font-black uppercase tracking-[0.45em] text-purple-400 drop-shadow-[0_0_10px_rgba(176,38,255,0.4)]">
              TECH ARSENAL
            </h1>


          </div>
        </div>
      )}

      {/* --- TITULO DE LA SECCIÓN DE ABOUT ME (Top Center, estilo Cyberpunk HUD Cian) --- */}
      {activePlanet === "about-me" && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none font-mono flex flex-col items-center animate-fade-in">
          {/* Main HUD Container */}
          <div className="relative px-8 py-3 bg-zinc-950/80 border border-cyan-500/25 backdrop-blur-xl rounded-md flex flex-col items-center gap-1 shadow-[0_0_45px_rgba(0,0,0,0.9),0_0_15px_rgba(0,243,255,0.05)]">
            
            {/* Cyber Corner Decos */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/80 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/80 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/80 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/80 rounded-br-sm"></div>

            {/* Small Top Telemetry */}
            <div className="flex items-center gap-1.5 text-[8px] text-cyan-500/60 uppercase tracking-[0.25em] font-semibold mb-0.5">
              <span>SYSTEM: SEC_01</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
              <span>ALT: 180KM</span>
            </div>

            {/* Title text */}
            <h1 className="text-white text-lg md:text-xl font-black uppercase tracking-[0.45em] text-cyan-400 drop-shadow-[0_0_10px_rgba(0,243,255,0.4)]">
              {isSpanish ? "NÚCLEO DE BIOGRAFÍA" : "BIOGRAPHY CORE"}
            </h1>


          </div>
        </div>

      )}

      {/* --- TITULO DE LA SECCIÓN DE CONTACTO (Top Center, estilo Cyberpunk HUD Rojo/Rosa) --- */}
      {activePlanet === "contact" && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none font-mono flex flex-col items-center animate-fade-in">
          {/* Main HUD Container */}
          <div className="relative px-8 py-3 bg-zinc-950/80 border border-red-500/25 backdrop-blur-xl rounded-md flex flex-col items-center gap-1 shadow-[0_0_45px_rgba(0,0,0,0.9),0_0_15px_rgba(239,68,68,0.05)]">
            
            {/* Cyber Corner Decos */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500/80 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500/80 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500/80 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500/80 rounded-br-sm"></div>

            {/* Small Top Telemetry */}
            <div className="flex items-center gap-1.5 text-[8px] text-red-500/60 uppercase tracking-[0.25em] font-semibold mb-0.5">
              <span>SYSTEM: SEC_05</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
              <span>ALT: 120KM</span>
            </div>

            {/* Title text */}
            <h1 className="text-white text-lg md:text-xl font-black uppercase tracking-[0.45em] text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
              {isSpanish ? "CENTRO DE CONTACTO" : "CONTACT HUB"}
            </h1>


          </div>
        </div>

      )}

      {/* --- TITULO DE LA SECCIÓN DE TRABAJO (Top Center, estilo Cyberpunk HUD Verde) --- */}
      {activePlanet === "career" && (
        <div className="fixed top-8 md:left-72 left-1/2 md:translate-x-0 -translate-x-1/2 z-40 pointer-events-none select-none font-mono flex flex-col items-center animate-fade-in">
          {/* Main HUD Container */}
          <div className="relative px-8 py-3 bg-zinc-950/80 border border-green-500/25 backdrop-blur-xl rounded-md flex flex-col items-center gap-1 shadow-[0_0_45px_rgba(0,0,0,0.9),0_0_15px_rgba(0,255,102,0.05)]">
            
            {/* Cyber Corner Decos */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-green-500/80 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-green-500/80 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-green-500/80 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-green-500/80 rounded-br-sm"></div>

            {/* Small Top Telemetry */}
            <div className="flex items-center gap-1.5 text-[8px] text-green-500/60 uppercase tracking-[0.25em] font-semibold mb-0.5">
              <span>SYSTEM: SEC_04</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
              <span>ALT: 210KM</span>
            </div>

            {/* Title text */}
            <h1 className="text-white text-lg md:text-xl font-black uppercase tracking-[0.45em] text-green-400 drop-shadow-[0_0_10px_rgba(0,255,102,0.05)]">
              {isSpanish ? "LÍNEA DE EXPERIENCIA" : "CAREER TIMELINE"}
            </h1>



            {isAdmin && (
              <button
                onClick={() => {
                  setEditingExperience({
                    id: "",
                    type: "work",
                    title: "",
                    organization: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                    display_order: 0,
                  });
                  setIsExperienceModalOpen(true);
                }}
                className="mt-2.5 px-4 py-1.5 border border-green-500/40 hover:bg-green-500/20 text-green-400 hover:text-white transition-all font-mono text-[9px] tracking-widest rounded-md uppercase cursor-pointer pointer-events-auto shadow-[0_0_15px_rgba(0,255,102,0.15)] hover:scale-105"
              >
                {isSpanish ? "+ Insertar Nodo" : "+ Insert Node"}
              </button>
            )}
          </div>
        </div>

      )}

      {/* --- BOTÓN FLOTANTE VOLVER A LA ÓRBITA (Para Proyectos, estilo oro/amarillo) --- */}
      {activePlanet === "projects" && (
        <button
          onClick={() => setActivePlanet(null)}
          className="fixed top-6 right-6 z-50 px-5 py-2.5 border border-yellow-500/40 bg-zinc-950/80 rounded-md text-yellow-500 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,204,0,0.25)] hover:scale-105"
        >
          <span>✕</span> {isSpanish ? "Regresar a la órbita" : "Return to Orbit"}
        </button>
      )}

      {/* --- BOTÓN FLOTANTE VOLVER A LA ÓRBITA (Para About Me, estilo cian) --- */}
      {activePlanet === "about-me" && (
        <button
          onClick={() => setActivePlanet(null)}
          className="fixed top-6 right-6 z-50 px-5 py-2.5 border border-cyan-500/40 bg-zinc-950/80 rounded-md text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.25)] hover:scale-105 cursor-pointer"
        >
          <span>✕</span> {isSpanish ? "Regresar a la órbita" : "Return to Orbit"}
        </button>
      )}

      {/* --- BOTÓN FLOTANTE VOLVER A LA ÓRBITA (Para Tech Arsenal, estilo morado) --- */}
      {activePlanet === "tech-arsenal" && (
        <button
          onClick={() => setActivePlanet(null)}
          className="fixed top-6 right-6 z-50 px-5 py-2.5 border border-purple-500/40 bg-zinc-950/80 rounded-md text-purple-400 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(176,38,255,0.25)] hover:scale-105 cursor-pointer"
        >
          <span>✕</span> {isSpanish ? "Regresar a la órbita" : "Return to Orbit"}
        </button>
      )}

      {/* --- BOTÓN FLOTANTE VOLVER A LA ÓRBITA (Para Contact, estilo rojo) --- */}
      {activePlanet === "contact" && (
        <button
          onClick={() => setActivePlanet(null)}
          className="fixed top-6 right-6 z-50 px-5 py-2.5 border border-red-500/40 bg-zinc-950/80 rounded-md text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:scale-105 cursor-pointer"
        >
          <span>✕</span> {isSpanish ? "Regresar a la órbita" : "Return to Orbit"}
        </button>
      )}

      {/* --- BOTÓN FLOTANTE VOLVER A LA ÓRBITA (Para Career, estilo verde) --- */}
      {activePlanet === "career" && (
        <button
          onClick={() => setActivePlanet(null)}
          className="fixed top-6 right-6 z-50 px-5 py-2.5 border border-green-500/40 bg-zinc-950/80 rounded-md text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.25)] hover:scale-105 cursor-pointer"
        >
          <span>✕</span> {isSpanish ? "Regresar a la órbita" : "Return to Orbit"}
        </button>
      )}

      {/* --- PANEL DE DETALLE DE SECCIÓN (SIDEBAR DERECHO, EXCLUYE PROYECTOS Y ABOUT ME) --- */}
      {showSidebar && activePlanet && activePlanet !== "projects" && activePlanet !== "about-me" && activePlanet !== "tech-arsenal" && activePlanet !== "contact" && activePlanet !== "career" && (
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

      {/* --- MODAL AÑADIR SOFTWARE (Solo Admin, fuera del canvas para evitar bugs de CSS transform) --- */}
      <AnimatePresence>
        {isAdmin && isTechModalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-text">
            <div 
              className="bg-[#050507] border border-purple-900/40 p-8 rounded-3xl max-w-md w-full relative shadow-[0_0_60px_rgba(176,38,255,0.15)] font-mono text-white"
            >
              <button onClick={() => setIsTechModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full hover:bg-purple-900/50 cursor-pointer">
                 <X size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <Database size={18} />
                 </div>
                 <h3 className="text-white font-black tracking-tighter text-2xl uppercase">Insert Node</h3>
              </div>
              
              <form onSubmit={handleAddTech} className="flex flex-col gap-6">
                 <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">Node_Name</label>
                    <input autoFocus required value={techFormData.name} onChange={(e) => setTechFormData({...techFormData, name: e.target.value})} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono focus:ring-1 focus:ring-purple-500/50" placeholder="e.g. Marvelous Designer" />
                 </div>
                 <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">Partition_Category</label>
                    <select value={techFormData.category} onChange={(e) => setTechFormData({...techFormData, category: e.target.value})} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono appearance-none focus:ring-1 focus:ring-purple-500/50">
                       <option value="3D & TEXTURING">3D & TEXTURING</option>
                       <option value="POST & CREATIVE">POST & CREATIVE</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">Icon_Key_Hash</label>
                    <select value={techFormData.icon_key} onChange={(e) => setTechFormData({...techFormData, icon_key: e.target.value})} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono appearance-none focus:ring-1 focus:ring-purple-500/50">
                       {Object.keys(ICON_MAP).map(key => (
                         <option key={key} value={key}>{key.replace('Si', '').replace('Icon', '')}</option>
                       ))}
                      </select>
                   </div>
                   
                   <button type="submit" className="mt-2 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold tracking-widest py-4 rounded-xl hover:from-purple-600 hover:to-purple-500 transition-all active:scale-95 shadow-[0_0_30px_rgba(176,38,255,0.3)] uppercase cursor-pointer">
                      Initialize Node
                   </button>
                </form>
              </div>
            </div>
          )}
          {isAdmin && (
          <ExperienceModal
            isOpen={isExperienceModalOpen}
            onClose={() => {
              setIsExperienceModalOpen(false);
              setEditingExperience(null);
              fetchExperience();
            }}
            itemToEdit={editingExperience}
          />
        )}
      </AnimatePresence>

      {/* --- MODO GALERÍA COMPLETA (ProjectsGrid 2D Overlay) --- */}
      <AnimatePresence>
        {showAllProjectsGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md overflow-y-auto custom-scrollbar"
          >
            {/* Botón de cerrar flotante */}
            <div className="sticky top-6 right-6 z-[70] flex justify-end px-6 box-border pointer-events-none">
              <button
                onClick={() => setShowAllProjectsGrid(false)}
                className="pointer-events-auto px-5 py-2.5 border border-yellow-500/40 bg-zinc-950/80 rounded-md text-yellow-500 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all font-mono uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,204,0,0.25)] hover:scale-105"
              >
                ✕ {isSpanish ? "Cerrar Galería" : "Close Gallery"}
              </button>
            </div>

            {/* Grid de Proyectos */}
            <div className="relative pt-10 pb-20">
              <ProjectsGrid />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
