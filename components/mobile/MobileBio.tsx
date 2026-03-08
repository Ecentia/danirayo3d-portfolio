'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ExperienceItem } from '@/types/database';
import { Briefcase, GraduationCap, Calendar } from 'lucide-react';

export default function MobileBio() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch a la base de datos (igual que en escritorio, pero puro para móvil)
  useEffect(() => {
    const fetchExperience = async () => {
      const { data } = await supabase
        .from('experience')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    };
    fetchExperience();
  }, []);

  return (
    <div className="pt-10 pb-10 w-full overflow-x-clip px-5">
      
      {/* HEADER PREMIUM */}
      <div className="flex items-center justify-between mb-10 px-1">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
          Career <span className="text-red-500">Path</span>
        </h2>
        <span className="text-[9px] font-bold tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
           {items.length} RECORDS
        </span>
      </div>

      {/* CONTENEDOR DE LA LÍNEA DE TIEMPO */}
      <div className="relative">
        
        {/* Línea de Energía (Spine) perfectamente alineada al centro de los iconos */}
        <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             className="w-full h-1/3 bg-gradient-to-b from-transparent via-red-600 to-transparent"
             animate={{ y: ['-100%', '300%'] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
           />
        </div>

        {loading ? (
          // Skeletons de Carga Premium
          <div className="flex flex-col gap-6 pl-14">
             {[1,2,3].map(i => (
                <div key={i} className="w-full h-40 bg-white/[0.02] backdrop-blur-md rounded-[2rem] animate-pulse border border-white/5" />
             ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-10">
            {items.map((item, i) => {
              const isWork = item.type === 'work';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
                  className="relative pl-14" // Espacio exacto para esquivar la línea
                >
                  
                  {/* NODO DEL TIMELINE (Icono Flotante) */}
                  <div className="absolute left-0 top-3 w-10 h-10 bg-[#030303] rounded-full flex items-center justify-center z-10">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                      isWork 
                        ? 'border-red-500/50 bg-red-950/30 text-red-500 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' 
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                    }`}>
                      {isWork ? <Briefcase size={14} /> : <GraduationCap size={14} />}
                    </div>
                  </div>

                  {/* TARJETA DE CONTENIDO (Glassmorphism Avanzado) */}
                  <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    
                    {/* Brillo superior del cristal */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    {/* METADATOS (Tipo y Fechas) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        isWork ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-zinc-400 border border-white/10'
                      }`}>
                        {isWork ? 'Professional' : 'Academic'}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                        <Calendar size={12} className="text-zinc-600" />
                        <span>{item.start_date}</span>
                        <span>—</span>
                        {item.end_date ? (
                          <span>{item.end_date}</span>
                        ) : (
                          <span className="text-red-500 font-bold animate-pulse">PRESENT</span>
                        )}
                      </div>
                    </div>

                    {/* TÍTULO Y ORGANIZACIÓN */}
                    <div className="mb-3">
                      <h3 className="text-xl font-black text-white leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-4 h-[1px] bg-red-600"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                          {item.organization}
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    {item.description && (
                      <p className="text-sm text-zinc-400 leading-relaxed font-light mt-4 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}