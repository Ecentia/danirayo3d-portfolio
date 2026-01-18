"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ExternalLink, Code2, Calendar } from "lucide-react";

// Definimos la interfaz localmente para asegurar coincidencia con tu SQL
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail_url: string;
  creation_date: string;
  client_slug: string;
}

export default function MissionLog() {
  const [missions, setMissions] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMissions() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) {
        setMissions(data);
      }
      setLoading(false);
    }

    fetchMissions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-yellow-400 animate-pulse">DESENCRIPTANDO ARCHIVOS...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      {missions.map((mission) => (
        <div 
          key={mission.id}
          className="group relative bg-black/40 border border-white/10 rounded-lg overflow-hidden hover:border-yellow-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]"
        >
          {/* Imagen / Thumbnail con efecto scanline */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <img 
              src={mission.thumbnail_url || "https://via.placeholder.com/400x300"} 
              alt={mission.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
            />
            {/* Fecha de la misión */}
            <div className="absolute top-2 right-2 z-20 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-mono text-white flex items-center gap-1 border border-white/10">
              <Calendar size={10} className="text-yellow-400" />
              {mission.creation_date || "2024"}
            </div>
          </div>

          {/* Contenido de la Data Slate */}
          <div className="p-4 relative z-20">
            <h3 className="text-xl font-black italic text-white mb-2 group-hover:text-yellow-400 transition-colors uppercase tracking-tight">
              {mission.title}
            </h3>
            
            <p className="text-gray-400 text-sm line-clamp-2 mb-4 font-mono">
              {mission.description || "Datos clasificados. Sin descripción disponible."}
            </p>

            {/* Tech Stack (Tags) */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mission.tags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 bg-white/5 text-blue-300 border border-blue-500/30 rounded">
                  {tag}
                </span>
              ))}
              {mission.tags && mission.tags.length > 3 && (
                <span className="text-[10px] px-2 py-1 text-gray-500">+{mission.tags.length - 3}</span>
              )}
            </div>

            {/* Botón de Acción */}
            <button className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ExternalLink size={16} />
              Iniciar Misión
            </button>
          </div>
        </div>
      ))}
      
      {/* Slot vacío para rellenar grid si es impar (decorativo) */}
      {missions.length % 2 !== 0 && (
        <div className="border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center min-h-[300px] text-white/20 font-mono text-xs">
          [ SLOT DE MISION VACÍO ]
        </div>
      )}
    </div>
  );
}