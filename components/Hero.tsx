"use client";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
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
  useTexture,
  useProgress,
} from "@react-three/drei";
import React, {
  useRef,
  useState,
  useEffect,
  Suspense,
  useLayoutEffect,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as THREE from "three";
import { X, Database, Settings, Pencil, ArrowLeft } from "lucide-react";

// Importar los componentes de las secciones para cargarlos en los overlays
import AboutMeHologram from "@/components/AboutMeHologram";
import { ICON_MAP } from "@/components/sections/TechStack";
import TechArsenalPanels from "@/components/TechArsenalPanels";
import CareerTimeline from "@/components/CareerTimeline";
import ContactPanels from "@/components/ContactPanels";
import LanguageToggle from "@/components/LanguageToggle";

// Nuevos imports para los proyectos en el aro
import { supabase } from "@/lib/supabase";
import { Project, TechItem, ExperienceItem } from "@/types/database";
import { useAdmin, CURRENT_SLUG } from "@/context/AdminContext";

// Overlays que solo aparecen tras una interacción: fuera del chunk inicial de la escena
const ProjectModal = dynamic(() => import("@/components/projects/ProjectModal"), { ssr: false });
const CropEditorModal = dynamic(() => import("@/components/projects/CropEditorModal"), { ssr: false });
const ExperienceModal = dynamic(() => import("@/components/sections/ExperienceModal"), { ssr: false });
const ProjectsGrid = dynamic(() => import("@/components/sections/ProjectGrid"), { ssr: false });
const SketchfabGallery = dynamic(() => import("@/components/sections/SketchfabGallery"), { ssr: false });
import { useLanguage } from "@/context/LanguageContext";
import { SiArtstation, SiInstagram, SiLinkedin } from "react-icons/si";

const getTranslation = (value: string | null, isSpanish: boolean): string => {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return (
        (isSpanish ? parsed.es : parsed.en) || parsed.en || parsed.es || value
      );
    }
  } catch {
    // No es JSON: el valor es texto plano sin traducciones y se devuelve tal cual
  }
  return value;
};

// Los loaders de drei/three (HDR, fuentes, texturas) lanzan el error hacia React
// cuando falla una descarga. Sin un boundary, un único asset caído desmonta la
// app entera ("Application error: a client-side exception has occurred").
interface SceneErrorBoundaryProps {
  name: string;
  fallback?: ReactNode;
  children: ReactNode;
}

class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[Escena 3D] Fallo en "${this.props.name}", se omite:`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// --- COMPONENTE 3D: El "Casco/Orbe" Sci-Fi Central ---
function SciFiHelmet({ isHidden = false }: { isHidden?: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const mainRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const scaleRef = useRef(isHidden ? 0 : 1.1);
  const [initialScale] = useState(() => Math.max(isHidden ? 0 : 1.1, 0.0001));

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const t = state.clock.getElapsedTime();
    if (mainRef.current) {
      mainRef.current.rotation.y = t * 0.15;
      mainRef.current.rotation.z = Math.sin(t * 0.4) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.35;
      ringRef.current.rotation.y = t * 0.2;
    }

    // Se encoge al entrar en un planeta en vez de desaparecer de golpe
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, isHidden ? 0 : 1.1, 4, delta);
    if (rootRef.current) {
      rootRef.current.scale.setScalar(Math.max(scaleRef.current, 0.0001));
      rootRef.current.visible = scaleRef.current > 0.01;
    }

    // La luz vive fuera del grupo que se oculta y solo se atenúa: si desaparecía de la escena,
    // cambiaba el número de luces y three recompilaba todos los materiales iluminados en ese
    // frame (~270 ms al abrir "Sobre mí", ~100 ms en Proyectos)
    if (lightRef.current) {
      lightRef.current.intensity = 3 * (scaleRef.current / 1.1);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.6}>
      <group ref={rootRef} scale={initialScale}>
        {/* Núcleo Central Rojo (El "Casco") */}
        <Sphere ref={mainRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#e01b1b"
            emissive="#2a0000"
            metalness={0.9}
            roughness={0.12}
            distort={0.22}
            speed={1.2}
          />
        </Sphere>
        {/* Anillo de energía orbitando: más fino y menos saturado */}
        <Torus
          ref={ringRef}
          args={[1.45, 0.018, 16, 128]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#ff2e2e"
            emissive="#ff2e2e"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </Torus>
      </group>
      {/* Luz interna: fuera del grupo ocultable para que el número de luces nunca cambie */}
      <pointLight ref={lightRef} color="red" intensity={isHidden ? 0 : 3} distance={3} />
    </Float>
  );
}

interface SmoothGroupProps {
  position: [number, number, number];
  scale?: number;
  /** Milisegundos tras montarse durante los que se dibuja aunque esté a escala ~0 */
  warmupMs?: number;
  children: ReactNode;
}

// Grupo que interpola posición y escala hacia sus props en lugar de saltar cuando
// cambian (p. ej. al reordenarse los planetas al entrar en una sección)
function SmoothGroup({ position, scale = 1, warmupMs = 0, children }: SmoothGroupProps) {
  const ref = useRef<THREE.Group>(null);
  const mountedAt = useRef<number | null>(null);
  const [initialPosition] = useState(position);
  const [initialScale] = useState(() => Math.max(scale, 0.0001));
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const group = ref.current;
    if (!group) return;
    const t = 1 - Math.exp(-4 * Math.min(rawDelta, 0.1));
    target.set(...position);
    group.position.lerp(target, t);
    const nextScale = THREE.MathUtils.lerp(group.scale.x, scale, t);
    group.scale.setScalar(Math.max(nextScale, 0.0001));
    // Durante el precalentado se dibuja aunque esté a escala ~0: geometrías, texturas y
    // shaders llegan a la GPU antes de que el usuario abra la sección
    if (mountedAt.current === null) mountedAt.current = state.clock.elapsedTime;
    const warming = state.clock.elapsedTime - mountedAt.current < warmupMs / 1000;
    group.visible = warming || nextScale > 0.01;
  });

  return (
    <group ref={ref} position={initialPosition} scale={initialScale}>
      {children}
    </group>
  );
}

// Glifos habituales del sitio: generarlos detrás del loader evita que el atlas de troika
// tenga que crecer y volver a subirse a la GPU justo al abrir una sección
const WARMUP_GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 áéíóúüñÁÉÍÓÚÜÑ¿?¡!.,:;-–—·()/&%+'\"@#";

// El primer <Text> que se dibuja sube el atlas de glifos y compila su shader: ese frame
// congelaba ~300 ms la primera sección que se abría (con visible={false} nunca se dibujaba
// y no precalentaba nada). Estos textos se dibujan siempre, transparentes y lejos de la
// cámara, para pagar ese coste mientras el loader tapa la escena. Una variante por cada
// peso de fuente (cada peso usa su propio atlas) y otra con contorno (shader distinto).
function FontWarmup() {
  return (
    <group position={[0, 0, -30]}>
      <Text fontSize={0.01} fillOpacity={0} frustumCulled={false}>
        {WARMUP_GLYPHS}
      </Text>
      <Text fontSize={0.01} fillOpacity={0} fontWeight="bold" frustumCulled={false}>
        {WARMUP_GLYPHS}
      </Text>
      <Text fontSize={0.01} fillOpacity={0} fontWeight="black" frustumCulled={false}>
        {WARMUP_GLYPHS}
      </Text>
      <Text
        fontSize={0.01}
        fillOpacity={0}
        fontWeight="bold"
        outlineWidth={0.001}
        outlineColor="#000000"
        outlineOpacity={0}
        frustumCulled={false}
      >
        {WARMUP_GLYPHS}
      </Text>
    </group>
  );
}

// Informa del progreso real de descarga (texturas, HDR, imágenes) al loader de la página
function LoadProgressReporter({ onProgress }: { onProgress?: (progress: number) => void }) {
  const active = useProgress((state) => state.active);
  const progress = useProgress((state) => state.progress);

  useEffect(() => {
    if (active) onProgress?.(progress);
  }, [active, progress, onProgress]);

  return null;
}

// Vive dentro del mismo Suspense que los planetas, así que solo se monta cuando sus
// texturas ya están listas. Espera a que termine TODA descarga, incluido el HDR del
// entorno: los materiales compilados sin él se recompilaban al mostrarse por primera vez
// (el holograma de "Sobre mí" congelaba ~300 ms). Después precompila shaders, sube
// texturas y solo entonces avisa para quitar el loader.
function SceneReadySignal({ onReady }: { onReady?: () => void }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const active = useProgress((state) => state.active);
  const startedRef = useRef(false);

  useEffect(() => {
    if (active || startedRef.current) return;
    startedRef.current = true;
    let ran = false;

    // Dos frames de margen: el entorno se asigna a scene.environment en el commit
    // posterior a que termine la descarga
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        ran = true;
        gl.compileAsync(scene, camera)
          .then(() => preuploadTextures(gl, scene))
          .catch((err: unknown) => {
            console.warn("[Escena 3D] No se pudieron precompilar los shaders; se continúa igualmente:", err);
          })
          .finally(() => onReady?.());
      });
    });

    return () => {
      // Si se desmonta antes de arrancar (StrictMode en desarrollo), permitir reintentarlo
      if (!ran) {
        cancelAnimationFrame(frame);
        startedRef.current = false;
      }
    };
  }, [active, gl, scene, camera, onReady]);

  return null;
}

// Sube a la GPU las texturas de toda la escena, también las de objetos ocultos. Sin esto
// three las sube en el primer frame en que se ven y ese frame se congela (foto del
// holograma, miniaturas de proyectos...)
function preuploadTextures(gl: THREE.WebGLRenderer, root: THREE.Object3D) {
  const seen = new Set<THREE.Texture>();
  const upload = (value: unknown) => {
    if (value instanceof THREE.Texture && !seen.has(value)) {
      seen.add(value);
      gl.initTexture(value);
    }
  };

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      for (const value of Object.values(material)) upload(value);
      const uniforms = (material as THREE.ShaderMaterial).uniforms;
      if (uniforms) {
        for (const uniform of Object.values(uniforms)) upload(uniform?.value);
      }
    }
  });
}

// El contenido que llega tarde desde Supabase (tarjetas de proyectos y experiencia) se
// monta después de la precompilación inicial: se vuelve a precalentar en un momento
// ocioso para que el coste no caiga en el clic que abre la sección
function SceneWarmup({ trigger }: { trigger: string }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | null = null;

    const run = () => {
      gl.compileAsync(scene, camera)
        .then(() => {
          if (!cancelled) preuploadTextures(gl, scene);
        })
        .catch((err: unknown) => {
          console.warn("[Escena 3D] Precalentado tardío fallido; se continúa igualmente:", err);
        });
    };

    // Margen para que los textos 3D terminen de generarse antes de compilar
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(run, { timeout: 2000 });
      } else {
        run();
      }
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (idleId !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    };
  }, [trigger, gl, scene, camera]);

  return null;
}

// Si la escena entera falla, el loader no debe quedarse esperando una señal que nunca llegará
function ReadyOnMount({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
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
  /** Oculta el planeta encogiéndolo, en vez de desmontarlo de golpe */
  isHidden?: boolean;
}

type MaterialWithEmissive = THREE.Material & { emissiveIntensity: number };

const hasEmissive = (material: THREE.Material): material is MaterialWithEmissive =>
  "emissiveIntensity" in material;

// Desfase estable por planeta para que no floten todos sincronizados
const floatSeed = (id: string): number =>
  (Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 628) / 100;

const zoomScaleFor = (targetId: string): number =>
  targetId === "projects" ? 4.2 : targetId === "career" ? 1.6 : 2.0;

function InteractivePlanet({
  position,
  targetId,
  label,
  color,
  emissive,
  planetType,
  onClickPlanet,
  activePlanet,
  isHidden = false,
}: PlanetProps) {
  const rootRef = useRef<THREE.Group>(null);
  const floatRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const satelliteRef = useRef<THREE.Group>(null);
  const moonOrbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isZoomed = activePlanet === targetId;
  const interactive = !isZoomed && !isHidden;
  const showHover = hovered && interactive;

  // Todo lo que antes cambiaba de golpe (escala, flotación, brillo, velocidad de giro)
  // se amortigua aquí frame a frame
  const anim = useRef({ hover: 0, zoom: isZoomed ? 1 : 0, scale: isHidden ? 0 : 0.95 });
  const [initialPosition] = useState(position);
  const [initialScale] = useState(() => (isHidden ? 0.0001 : 0.95));
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const seed = useMemo(() => floatSeed(targetId), [targetId]);

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

  // Si el planeta deja de ser interactivo estando en hover, el cursor no debe quedarse en "pointer"
  useEffect(() => {
    if (!interactive && hovered) {
      document.body.style.cursor = "auto";
    }
  }, [interactive, hovered]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const t = state.clock.getElapsedTime();
    const a = anim.current;

    a.hover = THREE.MathUtils.damp(a.hover, showHover ? 1 : 0, 8, delta);
    a.zoom = THREE.MathUtils.damp(a.zoom, isZoomed ? 1 : 0, 3, delta);
    const targetScale = isHidden ? 0 : isZoomed ? zoomScaleFor(targetId) : 0.95 + 0.13 * a.hover;
    a.scale = THREE.MathUtils.damp(a.scale, targetScale, isZoomed || isHidden ? 3.5 : 7, delta);

    const root = rootRef.current;
    if (root) {
      targetPosition.set(...position);
      root.position.lerp(targetPosition, 1 - Math.exp(-4 * delta));
      root.scale.setScalar(Math.max(a.scale, 0.0001));
      root.visible = a.scale > 0.01;
    }

    // Flotación propia (antes <Float>, que se quitaba al hacer zoom y remontaba el planeta)
    const floatAmount = 1 - a.zoom;
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t * 0.9 + seed) * 0.07 * floatAmount;
      floatRef.current.rotation.z = Math.sin(t * 0.45 + seed) * 0.06 * floatAmount;
      floatRef.current.rotation.x = Math.cos(t * 0.35 + seed) * 0.05 * floatAmount;
    }

    // Rotación acumulada: al cambiar la velocidad en hover ya no hay brinco de ángulo
    const spin = 1 + 1.5 * a.hover;
    const isStaticPlanet = targetId === "about-me" || targetId === "tech-arsenal";
    if (meshRef.current && !isStaticPlanet) {
      meshRef.current.rotation.y += delta * 0.3 * spin;
      meshRef.current.rotation.x += delta * 0.1 * spin;
    }

    if (ringRef.current) {
      const baseSpeed = targetId === "projects" && isZoomed ? 0.11 : 0.15;
      ringRef.current.rotation.z += delta * baseSpeed * (isZoomed ? 1 : spin);
    }

    if (satelliteRef.current) {
      if (planetType === "moons") {
        // Cada luna recorre su propia órbita inclinada girando sobre el eje de su anillo
        satelliteRef.current.rotation.y += delta * 0.35 * spin;
        if (moonOrbitRef.current) moonOrbitRef.current.rotation.y -= delta * 0.22 * spin;
      } else {
        const satSpeed = planetType === "pulsing" ? 0.12 : 0.6;
        satelliteRef.current.rotation.y += delta * satSpeed * spin;
      }
    }

    if (planetType === "pulsing" && meshRef.current) {
      meshRef.current.scale.setScalar(0.5 + Math.sin(t * 3.5) * 0.05 * spin);
    }

    // Brillo: la base está fija en el JSX y aquí solo se modula. El hover lo sube y el zoom
    // del planeta de proyectos lo baja (a 4.2x de escala el amarillo se quemaba).
    const glow = (1 + 1.4 * a.hover) * (targetId === "projects" ? 1 - 0.65 * a.zoom : 1);
    root?.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (!hasEmissive(material)) continue;
        material.userData.baseEmissive ??= material.emissiveIntensity;
        material.emissiveIntensity = material.userData.baseEmissive * glow;
      }
    });
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!interactive) return;
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!interactive) return;
    onClickPlanet(targetId);
  };

  const labelVisible = !isZoomed && !isHidden;

  return (
    <group ref={rootRef} position={initialPosition} scale={initialScale}>
      <group ref={floatRef}>
        {/* Zona invisible interactiva más grande para facilitar clic */}
        {interactive && (
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
              emissiveIntensity={0.4}
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
                emissiveIntensity={1.0}
                metalness={0.8}
                roughness={0.2}
              />
            </Sphere>
            <Torus
              ref={ringRef}
              args={[0.7, 0.03, 8, 48]}
              rotation={[Math.PI / 2.15, 0, 0]}
              renderOrder={1}
            >
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={1.5}
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
                emissiveIntensity={0.4}
                metalness={0.15}
                roughness={0.85}
              />
            </Sphere>
            <Sphere args={[0.5, 12, 12]}>
              <meshStandardMaterial
                color={color}
                wireframe
                emissive={emissive}
                emissiveIntensity={1.0}
              />
            </Sphere>
          </group>
        )}

        {/* 4. MOONS (Career - Green): núcleo satinado con atmósfera y dos lunas en órbitas
            inclinadas, marcadas por anillos finos */}
        {planetType === "moons" && (
          <group>
            <Sphere ref={meshRef} args={[0.4, 64, 64]}>
              <meshStandardMaterial
                color="#17804f"
                emissive={emissive}
                emissiveIntensity={0.2}
                metalness={0.35}
                roughness={0.35}
              />
            </Sphere>
            {/* Atmósfera: cara trasera translúcida que dibuja un halo suave en el contorno */}
            <Sphere args={[0.43, 48, 48]}>
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.06}
                side={THREE.BackSide}
                depthWrite={false}
                toneMapped={false}
              />
            </Sphere>

            {/* Órbita interior */}
            <group rotation={[0.35, 0, 0.25]}>
              <Torus args={[0.72, 0.004, 8, 128]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial
                  color="#b8ffd9"
                  transparent
                  opacity={0.3}
                  depthWrite={false}
                  toneMapped={false}
                />
              </Torus>
              <group ref={satelliteRef}>
                <Sphere position={[0.72, 0, 0]} args={[0.075, 24, 24]}>
                  <meshStandardMaterial
                    color="#eafff4"
                    emissive={emissive}
                    emissiveIntensity={0.5}
                    metalness={0.1}
                    roughness={0.5}
                  />
                </Sphere>
              </group>
            </group>

            {/* Órbita exterior */}
            <group rotation={[-0.55, 0, -0.35]}>
              <Torus args={[0.98, 0.003, 8, 160]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial
                  color="#b8ffd9"
                  transparent
                  opacity={0.18}
                  depthWrite={false}
                  toneMapped={false}
                />
              </Torus>
              <group ref={moonOrbitRef}>
                <Sphere position={[-0.98, 0, 0]} args={[0.05, 24, 24]}>
                  <meshStandardMaterial
                    color="#9aa5a0"
                    emissive={color}
                    emissiveIntensity={0.35}
                    metalness={0.1}
                    roughness={0.6}
                  />
                </Sphere>
              </group>
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
                emissiveIntensity={1.2}
                metalness={0.9}
                roughness={0.15}
              />
            </Sphere>

            {/* Anillo de Giroscopio 1 (Eje X/Z) */}
            <Torus
              ref={ringRef}
              args={[0.48, 0.012, 8, 48]}
              rotation={[Math.PI / 2.2, 0, 0]}
            >
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={2.0}
                toneMapped={false}
                transparent
                opacity={0.85}
              />
            </Torus>

            {/* Anillo de Giroscopio 2 (Eje Y/Z inclinado cruzado) */}
            <group ref={satelliteRef}>
              <Torus
                args={[0.58, 0.009, 8, 48]}
                rotation={[0.4, Math.PI / 4, 0.4]}
              >
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={emissive}
                  emissiveIntensity={1.0}
                  toneMapped={false}
                  transparent
                  opacity={0.7}
                />
              </Torus>
            </group>
          </group>
        )}

        {/* Etiqueta: texto limpio y una línea fina hacia el planeta; siempre montada
            para poder desvanecerla en lugar de hacerla desaparecer de golpe */}
        <Html position={[0, 0.8, 0]} center style={{ pointerEvents: "none" }}>
          <div
            className={`flex select-none flex-col items-center font-sans transition-opacity duration-500 ease-out ${
              labelVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span
              className={`whitespace-nowrap text-[13px] font-medium tracking-[-0.01em] transition-all duration-500 ease-out ${
                showHover ? "-translate-y-1 text-white" : "text-white/70"
              }`}
              style={{ textShadow: "0 1px 12px rgba(0, 0, 0, 0.85)" }}
            >
              {label}
            </span>
            <span
              className="mt-2 block w-px transition-all duration-500 ease-out"
              style={{
                height: showHover ? 28 : 16,
                background: `linear-gradient(to bottom, ${showHover ? color : "rgba(255, 255, 255, 0.35)"}, transparent)`,
              }}
            />
          </div>
        </Html>
      </group>
    </group>
  );
}

// --- COMPONENTE 3D: Manejador de Cámara para Zoom ---
type CameraShot = [[number, number, number], [number, number, number]];

// Encuadres por planeta: [posición de cámara, punto de mira]
const CAMERA_SHOTS: Record<string, CameraShot> = {
  // Posición ajustada para evitar recorte izquierdo y mantener planeta azul y amarillo
  "about-me": [[-4.5, 1.5, 1.75], [-2.8, 1.35, -1.0]],
  // Mirar a la misma X para evitar rotación angular asimétrica
  projects: [[4.4, 1.8, 5.15], [4.4, 1.8, -1.0]],
  // Centrado en el planeta y alejado para ver los paneles a los lados
  "tech-arsenal": [[-5.2, -1.0, 3.2], [-5.2, -1.2, 0.5]],
  // Planeta a la izquierda y panel de trayectoria a la derecha
  career: [[6.5, -1.15, 4.1], [6.5, -1.2, 0.5]],
  contact: [[0, -3.0, 3.2], [0, -3.2, 0.5]],
};
const DEFAULT_SHOT: CameraShot = [[0, 0, 5], [0, 0, 0]];
// Plano de entrada: más alejado y dentro de la niebla; la cámara se acerca al revelarse la web
const INTRO_SHOT: CameraShot = [[0, 0.6, 10.5], [0, 0, 0]];

// Secciones con paneles <Html> a ambos lados: en pantallas por debajo de este aspecto
// no caben, así que la cámara se aleja en proporción para que ningún panel quede cortado
const WIDE_SHOT_PLANETS = new Set(["contact", "tech-arsenal"]);
const WIDE_SHOT_MIN_ASPECT = 2.05;

// Suavizado crítico (estilo SmoothDamp): acelera y frena con naturalidad. El lerp
// exponencial anterior salía disparado en el primer frame y frenaba en seco.
function smoothDampVector(
  current: THREE.Vector3,
  target: THREE.Vector3,
  velocity: THREE.Vector3,
  smoothTime: number,
  delta: number,
) {
  const omega = 2 / smoothTime;
  const x = omega * delta;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  for (const axis of ["x", "y", "z"] as const) {
    const change = current[axis] - target[axis];
    const temp = (velocity[axis] + omega * change) * delta;
    velocity[axis] = (velocity[axis] - omega * temp) * decay;
    current[axis] = target[axis] + (change + temp) * decay;
  }
}

interface CameraManagerProps {
  activePlanet: string | null;
  holdIntro: boolean;
}

function CameraManager({ activePlanet, holdIntro }: CameraManagerProps) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(...INTRO_SHOT[1]), []);
  const posVelocity = useMemo(() => new THREE.Vector3(), []);
  const lookVelocity = useMemo(() => new THREE.Vector3(), []);
  const parallax = useMemo(() => new THREE.Vector2(), []);
  const parallaxTarget = useMemo(() => new THREE.Vector2(), []);
  const parallaxOffset = useMemo(() => new THREE.Vector3(), []);
  const introDone = useRef(false);

  useFrame((state, rawDelta) => {
    // Al volver de otra pestaña delta puede ser enorme: sin límite la cámara "teletransporta"
    const delta = Math.min(rawDelta, 0.1);

    const shot = holdIntro
      ? INTRO_SHOT
      : (activePlanet && CAMERA_SHOTS[activePlanet]) || DEFAULT_SHOT;
    targetPos.set(...shot[0]);
    targetLook.set(...shot[1]);

    if (!holdIntro && activePlanet && WIDE_SHOT_PLANETS.has(activePlanet)) {
      const aspect = size.width / Math.max(size.height, 1);
      const fit = Math.max(1, WIDE_SHOT_MIN_ASPECT / aspect);
      targetPos.sub(targetLook).multiplyScalar(fit).add(targetLook);
    }

    // Parallax sutil con el ratón solo en la vista general: dentro de un planeta
    // desplazaría el encuadre de los paneles
    const allowParallax = !holdIntro && !activePlanet;
    parallaxTarget.set(allowParallax ? state.pointer.x : 0, allowParallax ? state.pointer.y : 0);
    parallax.lerp(parallaxTarget, 1 - Math.exp(-2.5 * delta));
    targetPos.add(parallaxOffset.set(parallax.x * 0.35, parallax.y * 0.2, 0));

    if (!holdIntro && !introDone.current) {
      if (activePlanet || camera.position.distanceTo(targetPos) < 0.1) {
        introDone.current = true;
      }
    }

    // Entrada lenta y cinematográfica; navegación entre planetas ágil pero sin brusquedad
    const smoothTime = holdIntro ? 0.2 : introDone.current ? 0.5 : 1.4;
    smoothDampVector(camera.position, targetPos, posVelocity, smoothTime, delta);
    smoothDampVector(lookTarget, targetLook, lookVelocity, smoothTime, delta);
    camera.lookAt(lookTarget);
  });

  return null;
}

// --- COMPONENTE 3D: Anillo de Proyectos Orbitando ---
interface ProjectRingProps {
  projects: Project[];
  isSpanish: boolean;
  orbitSpeedMultiplier: number;
  onSelectProject: (id: string) => void;
  onEditCrop: (project: Project) => void;
  isProjectsActive: boolean;
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

function getBottomBannerShape(
  width: number,
  height: number,
  bannerHeight: number,
  radius: number,
) {
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

interface CroppedImageProps {
  url: string;
  scale: [number, number];
  position?: [number, number, number];
  radius?: number;
  renderOrder?: number;
  cropX?: number;
  cropY?: number;
}

// Cache de promesas por URL para no repetir descargas y para poder detectar
// fallos de carga (imagen rota, 404, o bloqueo por CORS en el bucket de Supabase)
const projectTextureCache = new Map<string, Promise<THREE.Texture>>();

// Fallos de red puntuales (p. ej. ERR_QUIC_PROTOCOL_ERROR contra el almacenamiento de
// Supabase) dejaban la tarjeta vacía toda la sesión: se reintenta con espera creciente
const TEXTURE_RETRY_DELAYS_MS = [800, 2000];

function loadTextureOnce(url: string): Promise<THREE.Texture> {
  return new Promise<THREE.Texture>((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    // Necesario para poder subir la imagen como textura de WebGL cuando viene
    // de otro dominio (Supabase Storage). Sin esto, si el bucket no manda las
    // cabeceras CORS correctas, la textura falla en silencio y la tarjeta
    // se queda transparente en vez de mostrar un error.
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      (err) => reject(err),
    );
  });
}

function loadProjectTexture(url: string): Promise<THREE.Texture> {
  const cached = projectTextureCache.get(url);
  if (cached) return cached;

  const attempt = async (): Promise<THREE.Texture> => {
    let lastError: unknown = null;
    for (let i = 0; i <= TEXTURE_RETRY_DELAYS_MS.length; i++) {
      try {
        return await loadTextureOnce(url);
      } catch (err) {
        lastError = err;
        if (i < TEXTURE_RETRY_DELAYS_MS.length) {
          await new Promise((resolve) => setTimeout(resolve, TEXTURE_RETRY_DELAYS_MS[i]));
        }
      }
    }
    throw lastError;
  };

  const promise = attempt().catch((err: unknown) => {
    // Si falla tras los reintentos, la sacamos del cache para permitir reintentar más
    // adelante (por ejemplo si el usuario vuelve a subir la imagen)
    projectTextureCache.delete(url);
    throw err;
  });

  projectTextureCache.set(url, promise);
  return promise;
}

function CroppedImage({
  url,
  scale,
  position,
  radius = 0,
  renderOrder = 0,
  cropX = 0.5,
  cropY = 0.5,
}: CroppedImageProps) {
  // Estado de carga asociado a su URL: "falta la URL" y "cargando otra URL" se derivan en el
  // render, sin resetear estado de forma síncrona dentro del efecto
  const [loaded, setLoaded] = useState<{
    url: string;
    texture: THREE.Texture | null;
    error: boolean;
  } | null>(null);
  const current = loaded && loaded.url === url ? loaded : null;
  const baseTexture = current?.texture ?? null;
  const hasError = !url || Boolean(current?.error);

  // Carga manual (sin Suspense) para que un fallo de red/CORS en UNA imagen
  // nunca deje la tarjeta invisible ni cuelgue el resto de la escena 3D.
  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    loadProjectTexture(url)
      .then((tex) => {
        if (!cancelled) setLoaded({ url, texture: tex, error: false });
      })
      .catch((err: unknown) => {
        console.error(
          "[Planeta de Proyectos] No se pudo cargar la imagen del proyecto:",
          url,
          err,
        );
        if (!cancelled) setLoaded({ url, texture: null, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const planeWidth = scale[0];
  const planeHeight = scale[1];

  // Clone texture so each card has independent offset/repeat settings
  const texture = useMemo(() => {
    if (!baseTexture) return null;
    const t = baseTexture.clone();
    // El wrapping se fija al crear el clon: cambiarlo después en un efecto modificaba un valor memorizado
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [baseTexture]);

  // Dimensiones de la imagen decodificada (1 como valor seguro mientras carga)
  const image = texture?.image as { width?: number; height?: number } | undefined;
  const imageWidth = image?.width || 1;
  const imageHeight = image?.height || 1;

  // Reactively calculate repeat and offset to achieve cover aspect ratio
  const { repeatX, repeatY, offsetX, offsetY } = useMemo(() => {
    const rs = planeWidth / planeHeight;
    const ri = imageWidth / imageHeight;

    let rx = 1.0;
    let ry = 1.0;
    let ox = 0.0;
    let oy = 0.0;

    if (rs < ri) {
      // Image is wider than the plane (crop horizontally)
      rx = rs / ri;
      ox = (1.0 - rx) * cropX;
    } else {
      // Image is taller than the plane (crop vertically)
      ry = ri / rs;
      oy = (1.0 - ry) * (1.0 - cropY);
    }

    return { repeatX: rx, repeatY: ry, offsetX: ox, offsetY: oy };
  }, [planeWidth, planeHeight, imageWidth, imageHeight, cropX, cropY]);

  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const texturedMeshRef = useRef<THREE.Mesh>(null);

  // Sube la miniatura a la GPU y compila el material de la tarjeta en cuanto carga, en un
  // momento ocioso. Si no, ambas cosas ocurren al abrir Proyectos y ese frame se congela.
  useEffect(() => {
    if (!texture) return;
    const warm = () => {
      gl.initTexture(texture);
      const mesh = texturedMeshRef.current;
      if (!mesh) return;
      gl.compileAsync(mesh, camera, scene).catch((err: unknown) => {
        console.warn("[Planeta de Proyectos] No se pudo precompilar la tarjeta:", err);
      });
    };
    // Safari no implementa requestIdleCallback aunque los tipos del DOM lo declaren
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(warm, 0);
    return () => clearTimeout(timer);
  }, [gl, scene, camera, texture]);

  // Apply settings to texture
  useLayoutEffect(() => {
    if (!texture) return;
    texture.repeat.set(repeatX, repeatY);
    texture.offset.set(offsetX, offsetY);
  }, [texture, repeatX, repeatY, offsetX, offsetY]);

  // Generate the rounded shape
  const shape = useMemo(() => {
    return getRoundedRectShape(planeWidth, planeHeight, radius);
  }, [planeWidth, planeHeight, radius]);

  // shapeGeometry genera las UV usando las coordenadas X/Y crudas de la forma
  // (que están centradas en 0,0), así que hay que remapearlas manualmente a 0-1
  // o la textura sale duplicada/espejada al usar RepeatWrapping.
  const geometry = useMemo(() => {
    const geo = new THREE.ShapeGeometry(shape);
    const pos = geo.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) + planeWidth / 2) / planeWidth;
      uv[i * 2 + 1] = (pos.getY(i) + planeHeight / 2) / planeHeight;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return geo;
  }, [shape, planeWidth, planeHeight]);

  // Mientras carga, o si la imagen falla, mostramos una placa sólida en vez
  // de dejar el hueco transparente (así nunca se ve el fondo "a través" de la tarjeta)
  if (!texture) {
    return (
      <mesh position={position} renderOrder={renderOrder} geometry={geometry}>
        <meshStandardMaterial
          color={hasError ? "#2a1414" : "#0d0d0d"}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={texturedMeshRef} position={position} renderOrder={renderOrder} geometry={geometry}>
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

// --- COMPONENTE 3D: Tarjeta Individual de Proyecto con Oclusión ---
interface ProjectCardProps {
  project: Project;
  idx: number;
  N: number;
  onSelectProject: (id: string) => void;
  onEditCrop: (project: Project) => void;
  isProjectsActive: boolean;
  allProjects: Project[];
  isSpanish: boolean;
  orbitSpeedMultiplier: number;
}

function ProjectCard({
  project,
  idx,
  N,
  onSelectProject,
  onEditCrop,
  isProjectsActive,
  allProjects,
  isSpanish,
  orbitSpeedMultiplier,
}: ProjectCardProps) {
  const cardRef = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [projectIdx, setProjectIdx] = useState(idx);
  const { isAdmin } = useAdmin();

  const theta = (idx / N) * 2 * Math.PI;
  const radius = 3.3; // Se alinea con el radio del aro exterior (3.30)
  const alpha = Math.PI / 2.15; // Inclinación de 83.7 grados
  const yOffset = 0.15; // Desplazamiento vertical constante más bajo

  // Pre-generar las formas 2D con esquinas redondeadas (tarjetas un pelín más grandes)
  const borderShape = useMemo(() => getRoundedRectShape(1.4, 0.92, 0.08), []);
  const bannerShape = useMemo(
    () => getBottomBannerShape(1.38, 0.9, 0.24, 0.07),
    [],
  );
  const frameShape = useMemo(() => {
    const outer = getRoundedRectShape(1.4, 0.92, 0.08);
    const inner = getRoundedRectShape(1.36, 0.88, 0.06);
    outer.holes.push(inner);
    return outer;
  }, []);

  const currentScale = useRef(1.0);
  const lastPhiRef = useRef(theta);

  // projectIdx se reinicia solo al cambiar idx o N: ProjectRing los incluye en la key

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
    const y = radius * Math.sin(phi) * Math.cos(alpha) + yOffset;
    const z = radius * Math.sin(phi) * Math.sin(alpha);

    // Rotación suave alrededor del eje Y global (nunca se ponen de cabeza ni giran sobre sí mismas)
    const ry = Math.atan2(x, z) * 0.85;

    if (cardRef.current) {
      cardRef.current.position.set(x, y, z);
      cardRef.current.rotation.set(0, ry, 0);

      // Lerp suave para escala únicamente
      const targetScale = hovered ? 1.12 : 1.0;
      currentScale.current = THREE.MathUtils.lerp(
        currentScale.current,
        targetScale,
        0.1,
      );
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
        <mesh
          position={[0, 0, 0.001]}
          rotation={[0, 0, Math.PI / 2]}
          renderOrder={2}
        >
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
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.59, 0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[-0.59, -0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.59, -0.38, 0.001]} renderOrder={2}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* VISTA FRONTAL: Marco, imagen, HUD y brillo de cristal */}

      {/* Marco Amarillo/Oro hueco (solo borde, sin fondo sólido) */}
      <mesh position={[0, 0, 0.012]} renderOrder={3}>
        <shapeGeometry args={[frameShape]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={hovered ? 1.2 : 0.25}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Capa invisible para capturar eventos de interacción */}
      <mesh
        renderOrder={5}
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
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Imagen del proyecto: se renderiza siempre (incluso sin thumbnail_url) para
          que, si falta la portada, se vea una placa sólida en vez de dejar un hueco
          transparente que muestre el fondo a través de la tarjeta */}
      <CroppedImage
        url={currentProject.thumbnail_url || ""}
        scale={[1.38, 0.9]}
        position={[0, 0, 0.01]}
        radius={0.07}
        renderOrder={2}
        cropY={
          currentProject.crop_y !== undefined && currentProject.crop_y !== null
            ? currentProject.crop_y
            : 0.5
        }
      />

      {/* Pencil Icon for crop alignment editing (Only visible to admin) */}
      {isAdmin && isProjectsActive && (
        <Html position={[0.59, 0.22, 0.025]} center>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onPointerOver={(e) => e.stopPropagation()}
            onPointerOut={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEditCrop(currentProject);
            }}
            className="p-1.5 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black rounded-full shadow-[0_0_15px_rgba(255,204,0,0.5)] transition-all cursor-pointer flex items-center justify-center border border-black/20"
            title={isSpanish ? "Ajustar recorte" : "Adjust crop"}
          >
            <Pencil size={12} className="stroke-[2.5]" />
          </button>
        </Html>
      )}

      {/* Cristal Transparente Reflectante (Glassmorphism Overlay) */}
      <mesh position={[0, 0, 0.012]} renderOrder={3}>
        <shapeGeometry args={[borderShape]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* HUD Detalle: Nombre de la Categoría/Tag (Top-Left) */}
      <Text
        position={[-0.63, 0.38, 0.015]}
        fontSize={0.04}
        color="#ffcc00"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.004}
        outlineColor="#000000"
        renderOrder={4}
      >
        {currentProject.tags && currentProject.tags[0]
          ? currentProject.tags[0]
          : "3D Art"}
      </Text>

      {/* Banner inferior semi-transparente para el título */}
      <mesh position={[0, 0, 0.016]} renderOrder={4}>
        <shapeGeometry args={[bannerShape]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>

      {/* Separador láser dorado */}
      <mesh position={[0, -0.22, 0.018]} renderOrder={4}>
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
        renderOrder={4}
      >
        {getTranslation(currentProject.title, isSpanish)}
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
          <boxGeometry args={[0.2, 0.06, 0.015]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0.32, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.015]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Sin pointLight propio: al montarse solo para el admin cambiaba el número de luces
          de la escena y obligaba a recompilar los shaders (tirón al abrir Proyectos) */}

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
                : "0 0 15px rgba(255,0,85,0.2)",
            }}
          >
            <span
              className="text-[8px] font-black uppercase tracking-wider text-white"
              style={{
                color: hovered ? "#00ffff" : "#ffffff",
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
                : "linear-gradient(to bottom, #ff0055, transparent)",
            }}
          />
        </div>
      </Html>
    </group>
  );
}

function ProjectRing({
  projects,
  isSpanish,
  orbitSpeedMultiplier,
  onSelectProject,
  onEditCrop,
  isProjectsActive,
}: ProjectRingProps) {
  const N = Math.min(projects.length, 6); // Limitar slots a un máximo de 6 para evitar saturar el aro

  return (
    <group>
      {projects.slice(0, N).map((project, idx) => (
        <ProjectCard
          // idx y N en la key: si cambian, la tarjeta se remonta y reinicia su proyecto rotativo
          key={`${project.id}-${idx}-${N}`}
          project={project}
          idx={idx}
          N={N}
          onSelectProject={onSelectProject}
          onEditCrop={onEditCrop}
          isProjectsActive={isProjectsActive}
          allProjects={projects}
          isSpanish={isSpanish}
          orbitSpeedMultiplier={orbitSpeedMultiplier}
        />
      ))}
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
      scale={1.5}
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
          <meshStandardMaterial
            color="#71717a"
            roughness={1.0}
            metalness={0.0}
          />
        </mesh>
        {/* Cráter 2 */}
        <mesh position={[-0.2, -0.1, 0.18]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#52525b"
            roughness={1.0}
            metalness={0.0}
          />
        </mesh>
        {/* Cráter 3 */}
        <mesh position={[0.0, -0.22, 0.18]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color="#71717a"
            roughness={1.0}
            metalness={0.0}
          />
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
          {isSpanish ? "Ver galería" : "View gallery"}
        </Text>
      </Billboard>
    </group>
  );
}

// Metadatos de cada sección: índice, color de acento del planeta y título
const SECTION_META: Record<string, { index: string; accent: string; es: string; en: string }> = {
  "about-me": { index: "01", accent: "#00f3ff", es: "Sobre mí", en: "About me" },
  projects: { index: "02", accent: "#ffcc00", es: "Proyectos", en: "Projects" },
  "tech-arsenal": { index: "03", accent: "#b026ff", es: "Tech Arsenal", en: "Tech Arsenal" },
  career: { index: "04", accent: "#00ff66", es: "Experiencia", en: "Career" },
  contact: { index: "05", accent: "#ff3366", es: "Contacto", en: "Contact" },
};

const SOCIAL_LINKS = [
  { id: "artstation", label: "ArtStation", href: "https://www.artstation.com/d_rayo3d/", Icon: SiArtstation },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/d_rayo.3d/", Icon: SiInstagram },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-rodriguez-rayo-67a5132aa/", Icon: SiLinkedin },
] as const;

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const TITLE_WORDS = ["Daniel", "Rayo"] as const;

const introVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

// Cada palabra sube desde detrás de una máscara (overflow-hidden en el contenedor)
const riseVariants: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1.2, ease: EASE_OUT_EXPO } },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT_EXPO } },
};

// Consultas sin estado de React: los efectos las encadenan con .then() en lugar de llamar
// a funciones que hacen setState de forma síncrona dentro del propio efecto
async function loadTechStack(): Promise<TechItem[]> {
  const { data, error } = await supabase
    .from("tech_stack")
    .select("*")
    .eq("client_slug", CURRENT_SLUG)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function loadExperience(): Promise<ExperienceItem[]> {
  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Nota: ya no usamos preloadImages() para las miniaturas de proyectos. Disparaba una
// petición con crossOrigin="anonymous" a la MISMA URL que luego carga CroppedImage/
// THREE.TextureLoader, y si el bucket no devolvía la cabecera CORS en esa respuesta
// concreta, el navegador reutilizaba esa entrada fallida y la textura se quedaba
// transparente sin ningún error visible.
async function loadProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

interface HeroProps {
  /** Progreso real de descarga de los assets 3D (0-100) */
  onProgress?: (progress: number) => void;
  /** Se llama una sola vez cuando la escena está lista para mostrarse */
  onReady?: () => void;
  /** true mientras el loader de la página tapa la escena */
  introActive?: boolean;
}

// --- COMPONENTE PRINCIPAL HERO ---
export default function Hero({ onProgress, onReady, introActive = false }: HeroProps) {
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const { isSpanish } = useLanguage();
  const aboutMeX =
    activePlanet === "career"
      ? -2.2
      : activePlanet === "about-me"
        ? -1.9
        : -2.8;
  const aboutMeY = activePlanet === "tech-arsenal" ? 0.8 : 1.35;
  const contactX = activePlanet === "tech-arsenal" ? -1.6 : 0;
  const techArsenalPos: [number, number, number] =
    activePlanet === "about-me" ? [-5.4, 0.32, -0.6] : [-5.2, -1.2, 0.5];
  const techArsenalScale = activePlanet === "about-me" ? 0.35 : 1.0;
  const [sidebarPlanet, setSidebarPlanet] = useState<string | null>(null);

  // Estados para base de datos de proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsReady, setProjectsReady] = useState(false);
  const [orbitWarmed, setOrbitWarmed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showAllProjectsGrid, setShowAllProjectsGrid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [croppingProject, setCroppingProject] = useState<Project | null>(null);
  const { isAdmin, deleteItem, notify } = useAdmin();

  // Estados para base de datos de tecnología (Tech Stack)
  const [techList, setTechList] = useState<TechItem[]>([]);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [techFormData, setTechFormData] = useState({
    name: "",
    category: "3D & TEXTURING",
    icon_key: "SiBlender",
  });

  const fetchTech = async () => {
    try {
      setTechList(await loadTechStack());
    } catch (err) {
      console.error("[Tech Arsenal] No se pudo cargar el listado:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadTechStack()
      .then((data) => {
        if (!cancelled) setTechList(data);
      })
      .catch((err: unknown) => {
        console.error("[Tech Arsenal] No se pudo cargar el listado:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techFormData.name) return;
    const { error } = await supabase.from("tech_stack").insert([
      {
        ...techFormData,
        client_slug: CURRENT_SLUG,
        display_order: techList.length,
      },
    ]);

    if (error) {
      notify("Error al añadir: " + error.message, "error");
    } else {
      notify("Software añadido", "success");
      setIsTechModalOpen(false);
      setTechFormData({
        name: "",
        category: "3D & TEXTURING",
        icon_key: "SiBlender",
      });
      fetchTech();
    }
  };

  const handleDeleteTech = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este programa?")) {
      await deleteItem("tech_stack", id);
      fetchTech();
    }
  };

  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState(1.0);
  // Estados para base de datos de trayectoria (Career Timeline)
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [editingExperience, setEditingExperience] =
    useState<ExperienceItem | null>(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

  const fetchExperience = async () => {
    try {
      setExperienceList(await loadExperience());
    } catch (err) {
      console.error("[Experiencia] No se pudo cargar la trayectoria:", err);
    }
  };

  // Se recarga al iniciar o cerrar la sesión de admin
  useEffect(() => {
    let cancelled = false;
    loadExperience()
      .then((data) => {
        if (!cancelled) setExperienceList(data);
      })
      .catch((err: unknown) => {
        console.error("[Experiencia] No se pudo cargar la trayectoria:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const handleDeleteExperience = async (id: string) => {
    if (
      confirm(
        isSpanish
          ? "¿Seguro que deseas eliminar este registro de experiencia?"
          : "Are you sure you want to delete this experience record?",
      )
    ) {
      await deleteItem("experience", id);
      fetchExperience();
    }
  };

  const fetchProjects = async () => {
    try {
      setProjects(await loadProjects());
      setProjectsReady(true);
    } catch (err) {
      console.error("[Planeta de Proyectos] No se pudieron cargar los proyectos:", err);
    }
  };

  // Cargar proyectos (las miniaturas las carga cada tarjeta por su cuenta)
  useEffect(() => {
    let cancelled = false;
    loadProjects()
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
        setProjectsReady(true);
      })
      .catch((err: unknown) => {
        console.error("[Planeta de Proyectos] No se pudieron cargar los proyectos:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Precargar foto del holograma About Me
  useEffect(() => {
    preloadImages(["/daniel_rayo.jfif"]);
  }, []);

  // Dar un par de frames al aro 3D pre-montado antes de revelar la UI de proyectos
  useEffect(() => {
    // orbitWarmed solo se consulta junto a projectsReady, así que no hace falta resetearlo
    if (!projectsReady) return;
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setOrbitWarmed(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [projectsReady]);

  // Atenuar la UI con un retardo alineado con el zoom de cámara. Se guarda para qué planeta
  // se cumplió el retardo (en vez de poner el estado a false dentro del efecto); al volver a
  // la órbita se limpia en diferido para que la próxima visita vuelva a esperar
  useEffect(() => {
    if (activePlanet === "projects" || activePlanet === "tech-arsenal") return;
    const timer = setTimeout(() => setSidebarPlanet(activePlanet), activePlanet ? 400 : 0);
    return () => clearTimeout(timer);
  }, [activePlanet]);
  const showSidebar = activePlanet !== null && sidebarPlanet === activePlanet;

  // Bloquear el scroll de la página de fondo cuando hay un overlay abierto
  useEffect(() => {
    if (
      activePlanet &&
      activePlanet !== "projects" &&
      activePlanet !== "tech-arsenal"
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activePlanet]);

  const showProjectsUI =
    activePlanet === "projects" && projectsReady && orbitWarmed;
  const dimMainUI =
    activePlanet === "projects"
      ? showProjectsUI
      : activePlanet === "tech-arsenal"
        ? true
        : Boolean(activePlanet && showSidebar);

  const sectionMeta = activePlanet ? SECTION_META[activePlanet] : undefined;
  const showSectionHeader =
    activePlanet === "projects" ? showProjectsUI : Boolean(sectionMeta);
  const hudVisible = !introActive && !activePlanet;
  const hudInteractive = hudVisible ? "pointer-events-auto" : "pointer-events-none";

  // Esc: cierra el modal de proyecto o la galería; si no hay nada abierto, vuelve a la órbita.
  // Los formularios de admin no se cierran con Esc para no perder lo que se esté escribiendo.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (croppingProject || isTechModalOpen || isExperienceModalOpen) return;
      if (isModalOpen) {
        setIsModalOpen(false);
        return;
      }
      if (showAllProjectsGrid) {
        setShowAllProjectsGrid(false);
        return;
      }
      setActivePlanet(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [croppingProject, isTechModalOpen, isExperienceModalOpen, isModalOpen, showAllProjectsGrid]);

  return (
    <section className="perspective-1000 relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050505] font-sans">
      {/* --- ESCENA 3D DE FONDO --- */}
      <div className="absolute inset-0 z-0">
        {/* Último recurso: si la escena 3D falla, se oculta pero el resto de la web sigue viva */}
        <SceneErrorBoundary name="Canvas" fallback={<ReadyOnMount onReady={onReady} />}>
          <Canvas
            camera={{ position: INTRO_SHOT[0] }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <color attach="background" args={["#050505"]} />
            <fog attach="fog" args={["#050505", 5, 12]} />
            <LoadProgressReporter onProgress={onProgress} />

            {/* Suspense propio dentro del Canvas: sin él, R3F suspende el árbol DOM
                de la página entera mientras cargan texturas y fuentes */}
            <Suspense fallback={null}>
              <SceneReadySignal onReady={onReady} />
              <SceneWarmup trigger={`${projectsReady}-${experienceList.length}`} />
              <Suspense fallback={null}>
                <FontWarmup />
              </Suspense>
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={2}
                color="#ff2e2e"
              />
              {/* El objeto 3D principal (Helmet): se encoge al entrar en un planeta en vez de desaparecer de golpe */}
              <SciFiHelmet
                isHidden={showProjectsUI || (activePlanet !== null && activePlanet !== "projects")}
              />

              {/* Controlador de Zoom de Cámara */}
              <CameraManager activePlanet={activePlanet} holdIntro={introActive} />

              {/* Planetas: nunca se desmontan al cambiar de sección; se desplazan y
                  encogen con animación en vez de aparecer y desaparecer de golpe */}
              <InteractivePlanet
                position={[aboutMeX, aboutMeY, -1.0]}
                targetId="about-me"
                label={isSpanish ? "Sobre mí" : "About me"}
                color="#00f3ff"
                emissive="#00b8d4"
                planetType="distorted"
                onClickPlanet={setActivePlanet}
                activePlanet={activePlanet}
              />

              {/* Holograma About Me pre-montado para evitar tirón en el primer clic;
                  crece desde su centro al abrir la sección */}
              <SmoothGroup
                position={[aboutMeX - 2.0, aboutMeY, -1.0]}
                scale={activePlanet === "about-me" ? 1 : 0}
                warmupMs={1500}
              >
                <AboutMeHologram
                  onClose={() => setActivePlanet(null)}
                  isSpanish={isSpanish}
                />
              </SmoothGroup>

              {/* PLANETA DE PROYECTOS & SU ARO DE TARJETAS 3D */}
              <group position={[4.8, 1.8, -1.0]}>
                <InteractivePlanet
                  position={[0, 0, 0]}
                  targetId="projects"
                  label={isSpanish ? "Proyectos" : "Projects"}
                  color="#ffcc00"
                  emissive="#ff9100"
                  planetType="ringed"
                  onClickPlanet={setActivePlanet}
                  activePlanet={activePlanet}
                  isHidden={activePlanet === "career"}
                />
                {/* Suspense aislado: las tarjetas llegan después de Supabase y usan <Text>;
                    si suspendieran el Suspense principal, se ocultaría la escena entera */}
                <Suspense fallback={null}>
                  {projectsReady && (
                    <SmoothGroup
                      position={[0, 0, 0]}
                      scale={activePlanet === "projects" ? 1 : 0}
                      warmupMs={1500}
                    >
                      <ProjectRing
                        projects={projects}
                        isSpanish={isSpanish}
                        orbitSpeedMultiplier={orbitSpeedMultiplier}
                        onSelectProject={(id) => {
                          setSelectedProjectId(id);
                          setIsModalOpen(true);
                        }}
                        onEditCrop={(proj) => {
                          setCroppingProject(proj);
                        }}
                        isProjectsActive={activePlanet === "projects"}
                      />
                      <ProjectsMoon
                        position={[3.5, 1.5, 1.2]}
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
                    </SmoothGroup>
                  )}
                </Suspense>
              </group>

              <SmoothGroup position={techArsenalPos} scale={techArsenalScale}>
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
              </SmoothGroup>

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
                  isHidden={activePlanet === "about-me"}
                />
                {/* Trayectoria como panel HTML (texto nítido), igual que Tech Arsenal y
                    Contacto. Sustituye al aro de tarjetas 3D, que se amontonaban */}
                {activePlanet === "career" && (
                  <CareerTimeline
                    experienceList={experienceList}
                    isAdmin={isAdmin}
                    isSpanish={isSpanish}
                    onEdit={(item) => {
                      setEditingExperience(item);
                      setIsExperienceModalOpen(true);
                    }}
                    onDelete={handleDeleteExperience}
                  />
                )}
              </group>

              <SmoothGroup position={[contactX, -3.2, 0.5]}>
                <InteractivePlanet
                  position={[0, 0, 0]}
                  targetId="contact"
                  label={isSpanish ? "Contacto" : "Contact"}
                  color="#ff3366"
                  emissive="#ff0044"
                  planetType="pulsing"
                  onClickPlanet={setActivePlanet}
                  activePlanet={activePlanet}
                  isHidden={activePlanet === "about-me"}
                />
                {activePlanet === "contact" && (
                  <Suspense fallback={null}>
                    <ContactPanels isSpanish={isSpanish} />
                  </Suspense>
                )}
              </SmoothGroup>

              {/* Entorno y partículas */}
              {/* HDR servido desde /public: preset="city" lo descargaba de raw.githack.com,
                  cuyo certificado SSL es inválido y rompía la web en producción */}
              <SceneErrorBoundary name="Environment">
                <Suspense fallback={null}>
                  <Environment files="/hdri/potsdamer_platz_1k.hdr" />
                </Suspense>
              </SceneErrorBoundary>
              <Stars
                radius={100}
                depth={50}
                count={1500}
                factor={3}
                saturation={0}
                fade
                speed={0.6}
              />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      </div>

      {/* Rejilla Retro superpuesta (Cyberpunk floor), ahora muy sutil */}
      <div className="cyber-grid-floor pointer-events-none absolute inset-0 z-1 opacity-20"></div>

      {/* Viñeta: centra la mirada en el título y suaviza los bordes de la escena */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)]"
      />

      {/* --- CONTENIDO UI PRINCIPAL (Se atenúa si un planeta está activo) ---
          Sin blur en la transición: desenfocar texto grande cada frame provocaba tirones */}
      <motion.div
        variants={introVariants}
        initial="hidden"
        animate={introActive ? "hidden" : "visible"}
        // will-change crea la capa de composición al montar (tras el loader). Sin ella, la
        // primera atenuación del título pintaba el texto gigante en el hilo principal: 277 ms
        className={`pointer-events-none relative z-10 flex flex-col items-center px-6 text-center transition-[opacity,scale] duration-700 ease-out [will-change:opacity,scale] ${
          dimMainUI ? "scale-[0.97] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Sin text-shadow difuminado: en un texto de este tamaño era lo más caro de pintar */}
        <h1 className="flex gap-[0.2em] text-[clamp(3.75rem,9.5vw,9rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
          {TITLE_WORDS.map((word) => (
            // El tracking negativo hace que el último glifo sobresalga de su caja:
            // padding lateral para que la máscara no lo recorte, compensado con margen negativo
            <span key={word} className="-mx-[0.1em] inline-block overflow-hidden px-[0.1em] pb-[0.08em]">
              <motion.span variants={riseVariants} className="inline-block">
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          variants={fadeVariants}
          className="mt-5 text-lg font-light text-white/65 [text-shadow:0_1px_16px_rgba(0,0,0,0.9)] md:text-xl"
        >
          {isSpanish ? "Artista 3D en Sevilla" : "3D artist based in Seville"}
        </motion.p>
      </motion.div>

      {/* --- HUD (solo en la órbita general) ---
          Sustituye a los satélites 3D de redes sociales: misma función, mucho menos ruido visual */}
      <motion.div
        initial={false}
        animate={{ opacity: hudVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: hudVisible ? 0.7 : 0, ease: EASE_OUT_EXPO }}
        className="pointer-events-none absolute inset-0 z-20 select-none"
      >
        <span className="absolute left-8 top-7 text-[15px] font-medium tracking-[-0.01em] text-white">
          Daniel Rayo
        </span>

        <div className={`absolute right-8 top-7 flex items-center gap-6 text-[13px] ${hudInteractive}`}>
          {isAdmin && (
            <Link
              href="/admin/settings"
              className="flex items-center gap-1.5 text-white/50 transition-colors duration-300 hover:text-white"
            >
              <Settings size={13} />
              Admin
            </Link>
          )}
          <LanguageToggle />
        </div>

        <p className="absolute bottom-8 left-8 text-[13px] text-white/45">
          {isSpanish ? "Haz clic en un planeta para explorar" : "Click a planet to explore"}
        </p>

        <div className={`absolute bottom-7 right-8 flex items-center gap-5 ${hudInteractive}`}>
          {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="text-white/50 transition-colors duration-300 hover:text-white"
            >
              <Icon size={17} />
            </a>
          ))}
        </div>
      </motion.div>

      {/* --- CABECERA DE SECCIÓN (una sola para todos los planetas) --- */}
      <AnimatePresence>
        {showSectionHeader && sectionMeta && (
          <motion.div
            key={activePlanet ?? "none"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.25, ease: EASE_OUT_EXPO } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25, ease: "easeIn" } }}
            className="pointer-events-none fixed left-1/2 top-8 z-40 flex -translate-x-1/2 select-none flex-col items-center gap-4"
          >
            <h2 className="text-[28px] font-medium tracking-[-0.02em] text-white [text-shadow:0_1px_16px_rgba(0,0,0,0.8)]">
              {isSpanish ? sectionMeta.es : sectionMeta.en}
            </h2>

            {activePlanet === "projects" && (
              <div
                role="group"
                aria-label={isSpanish ? "Velocidad de giro" : "Orbit speed"}
                className="pointer-events-auto flex items-center gap-4 text-[13px]"
              >
                <span className="text-white/35">{isSpanish ? "Velocidad" : "Speed"}</span>
                {[0.2, 0.5, 1.0, 2.0, 4.0].map((val) => {
                  const active = orbitSpeedMultiplier === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setOrbitSpeedMultiplier(val)}
                      className={`relative cursor-pointer pb-1 tabular-nums transition-colors duration-300 ${
                        active ? "text-white" : "text-white/40 hover:text-white/80"
                      }`}
                    >
                      {val === 0.2 ? (isSpanish ? "Lento" : "Slow") : `${val}×`}
                      <span
                        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-300 ease-out ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {activePlanet === "career" && isAdmin && (
              <button
                type="button"
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
                className="pointer-events-auto cursor-pointer text-[13px] text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {isSpanish ? "+ Añadir experiencia" : "+ Add experience"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VOLVER A LA ÓRBITA (una sola instancia para todos los planetas) --- */}
      <AnimatePresence>
        {activePlanet && (
          <motion.button
            key="back-to-orbit"
            type="button"
            onClick={() => setActivePlanet(null)}
            title={isSpanish ? "Volver (Esc)" : "Back (Esc)"}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="group fixed right-8 top-8 z-50 flex cursor-pointer items-center gap-2 text-[14px] text-white/60 transition-colors duration-300 hover:text-white"
          >
            <ArrowLeft size={15} className="transition-transform duration-300 ease-out group-hover:-translate-x-1" />
            {isSpanish ? "Volver" : "Back"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- MODAL DE DETALLE DE PROYECTO (Estándar de la web) --- */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProjectId={selectedProjectId}
        allProjectsList={projects}
      />

      {/* --- MODAL DE EDICIÓN DE RECORTE DE PROYECTO (Solo Admin) --- */}
      <CropEditorModal
        isOpen={croppingProject !== null}
        project={croppingProject}
        onClose={() => setCroppingProject(null)}
        onSaved={fetchProjects}
        isSpanish={isSpanish}
        notify={notify}
      />

      {/* --- MODAL AÑADIR SOFTWARE (Solo Admin, fuera del canvas para evitar bugs de CSS transform) --- */}
      <AnimatePresence>
        {isAdmin && isTechModalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-text">
            <div className="bg-[#050507] border border-purple-900/40 p-8 rounded-3xl max-w-md w-full relative shadow-[0_0_60px_rgba(176,38,255,0.15)] font-mono text-white">
              <button
                onClick={() => setIsTechModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full hover:bg-purple-900/50 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center text-purple-500 border border-purple-500/20">
                  <Database size={18} />
                </div>
                <h3 className="text-white font-black tracking-tighter text-2xl uppercase">
                  Insert Node
                </h3>
              </div>

              <form onSubmit={handleAddTech} className="flex flex-col gap-6">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">
                    Node_Name
                  </label>
                  <input
                    autoFocus
                    required
                    value={techFormData.name}
                    onChange={(e) =>
                      setTechFormData({ ...techFormData, name: e.target.value })
                    }
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono focus:ring-1 focus:ring-purple-500/50"
                    placeholder="e.g. Marvelous Designer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">
                    Partition_Category
                  </label>
                  <select
                    value={techFormData.category}
                    onChange={(e) =>
                      setTechFormData({
                        ...techFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono appearance-none focus:ring-1 focus:ring-purple-500/50"
                  >
                    <option value="3D & TEXTURING">3D & TEXTURING</option>
                    <option value="POST & CREATIVE">POST & CREATIVE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">
                    Icon_Key_Hash
                  </label>
                  <select
                    value={techFormData.icon_key}
                    onChange={(e) =>
                      setTechFormData({
                        ...techFormData,
                        icon_key: e.target.value,
                      })
                    }
                    className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-mono appearance-none focus:ring-1 focus:ring-purple-500/50"
                  >
                    {Object.keys(ICON_MAP).map((key) => (
                      <option key={key} value={key}>
                        {key.replace("Si", "").replace("Icon", "")}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold tracking-widest py-4 rounded-xl hover:from-purple-600 hover:to-purple-500 transition-all active:scale-95 shadow-[0_0_30px_rgba(176,38,255,0.3)] uppercase cursor-pointer"
                >
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
                title={isSpanish ? "Cerrar (Esc)" : "Close (Esc)"}
                className="group pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-[14px] text-white/70 transition-colors duration-300 hover:text-white"
              >
                <X size={15} className="transition-transform duration-300 ease-out group-hover:rotate-90" />
                {isSpanish ? "Cerrar galería" : "Close gallery"}
              </button>
            </div>

            {/* Grid de Proyectos */}
            <div className="relative pt-10 pb-4">
              <ProjectsGrid />
            </div>

            {/* Visualizador Sketchfab */}
            <div className="relative pb-24 border-t border-zinc-900/60">
              <SketchfabGallery />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Los keyframes y utilidades de animación viven ahora en globals.css para que
          también lleguen a los paneles renderizados con <Html> de drei */}
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
      `}</style>
    </section>
  );
}
