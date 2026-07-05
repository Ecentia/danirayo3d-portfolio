import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { ExperienceItem } from "@/types/database";

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

// Helper para generar rectángulos con esquinas redondeadas
function getRoundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

interface CareerCardProps {
  item: ExperienceItem;
  idx: number;
  N: number;
  onEdit: (item: ExperienceItem) => void;
  onDelete: (id: string) => void;
  allExperience: ExperienceItem[];
  isAdmin: boolean;
  isSpanish: boolean;
}

function CareerCard({
  item,
  idx,
  N,
  onEdit,
  onDelete,
  allExperience,
  isAdmin,
  isSpanish,
}: CareerCardProps) {
  const cardRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [itemIdx, setItemIdx] = useState(idx);

  const theta = (idx / N) * 2 * Math.PI;
  const radius = 1.90; // Radio optimizado para evitar recortarse por la cámara
  const beta = Math.PI / 5.5; // Inclinación lateral para visualización tridimensional
  const lastPhiRef = useRef(theta);

  useEffect(() => {
    setItemIdx(idx);
  }, [idx, N]);

  useFrame((state) => {
    if (!cardRef.current) return;
    const t = state.clock.getElapsedTime();
    const phi = theta + t * 0.11; // Rotación suave
    const normalizedPhi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Crossover por detrás del planeta
    const lastPhi = lastPhiRef.current;
    lastPhiRef.current = normalizedPhi;
    const crossed = lastPhi < 1.5 * Math.PI && normalizedPhi >= 1.5 * Math.PI;
    if (crossed && allExperience.length > N) {
      setItemIdx((prevIdx) => (prevIdx + N) % allExperience.length);
    }

    // Posición en órbita vertical inclinada original
    const x = (radius * Math.sin(phi)) * Math.sin(beta);
    const y = radius * Math.cos(phi);
    const z = (radius * Math.sin(phi)) * Math.cos(beta);

    // Las tarjetas se mantienen rectas de cara a la cámara
    cardRef.current.position.set(x, y, z);
    cardRef.current.rotation.set(0, 0, 0);

    // Lerp de escala en hover
    const targetScale = hovered ? 1.20 : 1.0;
    cardRef.current.scale.setScalar(THREE.MathUtils.lerp(cardRef.current.scale.x, targetScale, 0.1));
  });

  const currentItem = allExperience[itemIdx] || item;
  const titleText = getTranslation(currentItem.title, isSpanish);
  const descText = getTranslation(currentItem.description, isSpanish);

  // Dimensiones y Layout Dinámicos de tarjeta basados en el texto
  const showAdmin = isAdmin;
  const titleLines = Math.ceil((titleText || "").length / 38) || 1;
  const descLines = (descText || "").split("\n").reduce((acc: number, line: string) => {
    const charsPerLine = 58;
    const linesForSegment = Math.ceil(line.length / charsPerLine) || 1;
    return acc + linesForSegment;
  }, 0);

  const cardWidth = 1.5;
  const baseHeight = 0.55;
  const adminOffset = showAdmin ? 0.22 : 0;
  const cardHeight = Math.max(
    baseHeight + titleLines * 0.09 + descLines * 0.052 + adminOffset + 0.10,
    0.85
  );

  const borderThickness = 0.04;
  const outerShape = getRoundedRectShape(cardWidth + borderThickness, cardHeight + borderThickness, 0.08);
  const innerShape = getRoundedRectShape(cardWidth, cardHeight, 0.06);

  // Posiciones de los elementos relativas al centro de la tarjeta
  const yHeader = cardHeight / 2 - 0.13;
  const yTitle = cardHeight / 2 - 0.31;
  const yOrg = cardHeight / 2 - 0.31 - titleLines * 0.09 - 0.09;
  const yDesc = cardHeight / 2 - 0.31 - titleLines * 0.09 - 0.09 - 0.12;
  const yAdmin = -cardHeight / 2 + 0.13;

  return (
    <group
      ref={cardRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Placa Trasera Metálica (Fondo oscuro y legible, OPACO y Mate) */}
      <mesh position={[0, 0, 0]} renderOrder={2}>
        <shapeGeometry args={[innerShape]} />
        <meshStandardMaterial
          color="#0b0c10"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Marco de Neón Verde (Detrás, sobresale por los bordes) */}
      <mesh position={[0, 0, -0.005]} renderOrder={1}>
        <shapeGeometry args={[outerShape]} />
        <meshStandardMaterial
          color="#00ff66"
          emissive="#00ff66"
          emissiveIntensity={hovered ? 3.0 : 0.8}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Cristal Transparente Frontal */}
      <mesh position={[0, 0, 0.003]} renderOrder={3}>
        <shapeGeometry args={[innerShape]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0.1}
          metalness={0.1}
          transmission={0.3}
          thickness={0.02}
          ior={1.5}
        />
      </mesh>

      {/* --- HUD DE LA TARJETA (Textos Drei) --- */}

      {/* Tipo / Categoría (Top Left) */}
      <Text
        position={[-0.67, yHeader, 0.01]}
        fontSize={0.04}
        color="#00ff66"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
        renderOrder={4}
      >
        {currentItem.type === "work" ? (isSpanish ? "EXPERIENCIA" : "EXPERIENCE") : (isSpanish ? "EDUCACIÓN" : "EDUCATION")}
      </Text>

      {/* Fechas (Top Right) */}
      <Text
        position={[0.67, yHeader, 0.01]}
        fontSize={0.035}
        color="#a1a1aa"
        anchorX="right"
        anchorY="middle"
        fontWeight="bold"
        renderOrder={4}
      >
        {`${currentItem.start_date} - ${currentItem.end_date || (isSpanish ? "ACTIVO" : "ACTIVE")}`}
      </Text>

      {/* Título Principal */}
      <Text
        position={[-0.67, yTitle, 0.01]}
        fontSize={0.06}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
        fontWeight="black"
        maxWidth={1.34}
        renderOrder={4}
      >
        {titleText.toUpperCase()}
      </Text>

      {/* Organización */}
      <Text
        position={[-0.67, yOrg, 0.01]}
        fontSize={0.045}
        color="#34d399"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
        renderOrder={4}
      >
        {currentItem.organization.toUpperCase()}
      </Text>

      {/* Descripción corta */}
      <Text
        position={[-0.67, yDesc, 0.01]}
        fontSize={0.036}
        color="#e4e4e7"
        anchorX="left"
        anchorY="top"
        maxWidth={1.34}
        lineHeight={1.4}
        renderOrder={4}
      >
        {descText}
      </Text>

      {/* Controles Admin 3D */}
      {isAdmin && (
        <group position={[0, yAdmin, 0.01]}>
          <Text
            position={[-0.3, 0, 0]}
            fontSize={0.038}
            color="#00ff66"
            fontWeight="bold"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(currentItem);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
            renderOrder={4}
          >
            [ EDIT ]
          </Text>
          <Text
            position={[0.3, 0, 0]}
            fontSize={0.038}
            color="#ef4444"
            fontWeight="bold"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(currentItem.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
            renderOrder={4}
          >
            [ DELETE ]
          </Text>
        </group>
      )}
    </group>
  );
}

interface CareerRingProps {
  experienceList: ExperienceItem[];
  isAdmin: boolean;
  isSpanish: boolean;
  onEdit: (item: ExperienceItem) => void;
  onDelete: (id: string) => void;
}

export default function CareerRing({
  experienceList,
  isAdmin,
  isSpanish,
  onEdit,
  onDelete,
}: CareerRingProps) {
  const N = Math.min(experienceList.length, 6); // Límite de 6 slots orbitando simultáneamente

  if (N === 0) return null;

  return (
    <group>
      {experienceList.slice(0, N).map((item, idx) => (
        <CareerCard
          key={item.id}
          item={item}
          idx={idx}
          N={N}
          onEdit={onEdit}
          onDelete={onDelete}
          allExperience={experienceList}
          isAdmin={isAdmin}
          isSpanish={isSpanish}
        />
      ))}
    </group>
  );
}
