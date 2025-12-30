'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { CURRENT_SLUG } from '@/context/AdminContext'; // Usamos la misma constante que AboutMe
import TechStack from '@/components/sections/TechStack';
import { ArrowRight, Terminal } from 'lucide-react';

export default function MobileHome({ onNavigate }: { onNavigate: (v: any) => void }) {
  // Estado local independiente para la versión móvil
  const [description, setDescription] = useState<string>('Cargando perfil...');
  const [title, setTitle] = useState<string>('ARQUITECTO DE REALIDADES');

  // 1. LÓGICA COPIADA Y ADAPTADA DE AboutMe.tsx
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from('portfolio_content')
          .select('title, description')
          .eq('client_slug', CURRENT_SLUG)
          .eq('section_id', 'about_me') // Misma ID que usa la web
          .single();
        
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
        } else {
          // Fallback por si no carga
          setDescription('Soy Daniel Rayo. Mi código no solo compila, respira...');
        }
      } catch (error) {
        console.error("Error cargando perfil móvil:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col pb-32 w-full overflow-x-hidden">
      
      {/* --- HEADER PERFIL --- */}
      <div className="pt-8 px-6 pb-6">
        <div className="flex items-center gap-5">
           <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-10">
                <Image src="/favicon.ico" alt="Profile" fill className="object-cover" />
              </div>
              <div className="absolute -inset-2 bg-red-600/20 blur-xl rounded-full z-0"></div>
           </div>
           
           <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                Daniel <span className="text-red-600">Rayo</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-white/10 border border-white/5 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                  Developer
                </span>
                <span className="px-2 py-0.5 bg-red-600/20 border border-red-600/30 rounded text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  3D Artist
                </span>
              </div>
           </div>
        </div>
      </div>

      {/* --- DESCRIPCIÓN NATIVA (Sin importar componente externo) --- */}
      <div className="px-4 w-full">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group">
           {/* Icono decorativo */}
           <Terminal className="absolute top-4 right-4 text-white/5 w-8 h-8 group-hover:text-red-500/20 transition-colors" />

           <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
             Bio_Data
           </h2>
           
           {/* Renderizado de texto limpio adaptado a móvil */}
           <div className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase leading-none opacity-90">
                {title}
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed font-light">
                {description}
              </p>
           </div>

           <button 
             onClick={() => onNavigate('PROJECTS')}
             className="w-full mt-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
           >
             Ver Proyectos <ArrowRight size={14} />
           </button>
        </div>
      </div>

      {/* --- TECH STACK (Software Arsenal) --- */}
      <div className="mt-8 px-2 w-full">
        <div className="flex items-center gap-2 px-4 mb-3 opacity-80">
            <span className="w-1 h-3 bg-red-600"></span>
            <h2 className="text-[10px] font-bold text-white uppercase tracking-widest">Software Arsenal</h2>
        </div>
        
        {/* Contenedor corregido para evitar el descuadre */}
        <div className="w-full overflow-hidden rounded-xl bg-black/20 border border-white/5 py-4">
           {/* Usamos transformaciones para asegurar que el grid de iconos (que es ancho) quepa en pantallas estrechas */}
           <div className="scale-[0.80] sm:scale-90 origin-top w-[125%] sm:w-[110%] -ml-[12.5%] sm:-ml-[5%]">
              <TechStack />
           </div>
        </div>
      </div>

    </div>
  );
}