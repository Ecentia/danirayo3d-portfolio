"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Cpu, 
  Database, 
  Layout, 
  Terminal, 
  PenTool, 
  Box, 
  Code2,
  Layers
} from "lucide-react";

interface TechItem {
  id: string;
  name: string;
  category: string;
  icon_key: string;
}

// Mapeo de iconos según categoría para darle variedad visual
const CategoryIcons: Record<string, React.ReactNode> = {
  "Frontend": <Layout size={18} />,
  "Backend": <Terminal size={18} />,
  "Database": <Database size={18} />,
  "Design": <PenTool size={18} />,
  "3D": <Box size={18} />,
  "Other": <Cpu size={18} />
};

export default function TechInventory() {
  const [items, setItems] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TechItem | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTech() {
      const { data } = await supabase
        .from("tech_stack")
        .select("*")
        .order("category", { ascending: true });

      if (data) setItems(data);
      setLoading(false);
    }
    fetchTech();
  }, []);

  // Agrupar por categorías
  const grouped = items.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<string, TechItem[]>);

  if (loading) return <div className="text-yellow-400 font-mono animate-pulse p-8">ESCANEANDO ARSENAL...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      
      {/* 1. EL INVENTARIO (GRID) */}
      <div className="flex-1 space-y-8">
        {Object.entries(grouped).map(([category, techItems]) => (
          <div key={category}>
            <h3 className="flex items-center gap-2 text-white/50 font-mono text-sm mb-3 uppercase tracking-wider">
              {CategoryIcons[category] || <Layers size={16} />}
              {category} ::
            </h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {techItems.map((item) => (
                <button
                  key={item.id}
                  onMouseEnter={() => setSelectedItem(item)}
                  className={`
                    group relative aspect-square bg-white/5 border-2 rounded-lg flex items-center justify-center
                    transition-all duration-100
                    ${selectedItem?.id === item.id 
                      ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)] scale-110 z-10" 
                      : "border-white/10 hover:border-white/30 hover:bg-white/10"}
                  `}
                >
                  {/* Icono / Iniciales */}
                  <span className={`font-black text-xl ${selectedItem?.id === item.id ? "text-yellow-400" : "text-white/40 group-hover:text-white"}`}>
                    {/* Si tuviéramos iconos reales los pondríamos aquí, por ahora usamos la inicial estilizada */}
                    {item.name.slice(0, 2).toUpperCase()}
                  </span>
                  
                  {/* Decoración esquina */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-current opacity-30" />
                  <div className="absolute bottom-1 left-1 w-1 h-1 bg-current opacity-30" />
                </button>
              ))}
              
              {/* Slots vacíos de relleno para efecto visual */}
              {[...Array(Math.max(0, 6 - techItems.length))].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-black/20 border border-white/5 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2. PANEL DE DETALLES (ITEM STATS) */}
      <div className="md:w-64 shrink-0">
        <div className="sticky top-0 p-4 bg-black/40 border border-white/10 rounded-xl min-h-[300px] flex flex-col">
          <div className="text-xs font-mono text-white/30 mb-4 border-b border-white/5 pb-2">
            // ITEM_DETAILS
          </div>

          {selectedItem ? (
            <div className="animate-in slide-in-from-right-4 fade-in duration-200">
              <div className="w-16 h-16 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center text-black font-black text-2xl shadow-lg mx-auto">
                 {selectedItem.name.slice(0, 1)}
              </div>
              
              <h2 className="text-xl font-bold text-white text-center mb-1">{selectedItem.name}</h2>
              <div className="text-center mb-6">
                <span className="text-xs font-mono px-2 py-1 rounded bg-white/10 text-yellow-200 border border-yellow-500/30">
                  Clase: {selectedItem.category}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Maestría</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => <div key={n} className="w-2 h-2 bg-green-500 rounded-full" />)}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Rareza</span>
                  <span className="text-purple-400">ÉPICO</span>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded border border-white/5 text-center italic">
                  "Herramienta esencial para el desarrollo de soluciones digitales."
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-center">
              <Code2 size={48} className="mb-4 opacity-20" />
              <p className="font-mono text-sm">Selecciona un ítem del inventario para ver sus estadísticas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}