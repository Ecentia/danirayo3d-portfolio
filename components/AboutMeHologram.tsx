import { useEffect, useState, useRef } from "react";
import { Image, Text, Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { supabase } from "@/lib/supabase";
import { CURRENT_SLUG } from "@/context/AdminContext";

interface AboutMeHologramProps {
  onClose: () => void;
}

export default function AboutMeHologram({ onClose }: AboutMeHologramProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [content, setContent] = useState({
    title: "ARQUITECTO DE REALIDADES",
    description: "Cargando datos...",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("portfolio_content")
        .select("title, description")
        .eq("client_slug", CURRENT_SLUG)
        .eq("section_id", "about_me")
        .single();

      if (data) {
        setContent({ title: data.title, description: data.description });
      }
    };
    fetchData();
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Balanceo vertical (floating)
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
      // Inclinaciones sutiles (swaying)
      groupRef.current.rotation.z = Math.sin(t * 1.0) * 0.015;
      groupRef.current.rotation.x = Math.cos(t * 1.2) * 0.015;
    }
  });

  return (
    <Billboard>
      <group ref={groupRef}>
        {/* 1. Marco brillante Cyan (Borde exterior) */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.84, 1.84]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* 2. Placa Base Metálica Oscura */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshStandardMaterial
            color="#080808"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* 3. Foto de Daniel Rayo (A la izquierda) */}
        <Image
          url="/daniel_rayo.jfif"
          scale={[1.0, 1.4]}
          position={[-0.8, 0, 0.01]}
          radius={0.03}
        />

        {/* 4. Título de la sección */}
        <Text
          position={[-0.15, 0.55, 0.02]}
          fontSize={0.08}
          color="#00f3ff"
          anchorX="left"
          anchorY="middle"
          fontWeight="bold"
          maxWidth={1.0}
        >
          {content.title.toUpperCase()}
        </Text>

        {/* 5. Línea divisoria en 3D */}
        <mesh position={[0.325, 0.43, 0.01]}>
          <planeGeometry args={[0.95, 0.008]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* 6. Texto de descripción de la Bio */}
        <Text
          position={[-0.15, 0.35, 0.02]}
          fontSize={0.045}
          color="white"
          anchorX="left"
          anchorY="top"
          maxWidth={0.95}
          lineHeight={1.4}
        >
          {content.description}
        </Text>

        {/* 7. Telemetría inferior */}
        <Text
          position={[-0.15, -0.75, 0.02]}
          fontSize={0.035}
          color="#666666"
          anchorX="left"
          anchorY="bottom"
        >
          SYS.LOC: ABOUT_ME // SEVILLA, ES
        </Text>
      </group>
    </Billboard>
  );
}
