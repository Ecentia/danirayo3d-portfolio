'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ExperienceItem } from '@/types/database';
import { Briefcase, GraduationCap, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const getTranslation = (value: string | null, isSpanish: boolean): string => {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return (isSpanish ? parsed.es : parsed.en) || parsed.en || parsed.es || value;
    }
  } catch {
    // No es JSON: el valor es texto plano sin traducciones y se devuelve tal cual
  }
  return value;
};

export default function MobileBio() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSpanish } = useLanguage();

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
      <div className="mb-10 flex items-baseline justify-between px-1">
        <h2 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          {isSpanish ? "Experiencia" : "Experience"}
        </h2>
        <span className="text-sm tabular-nums text-white/40">{items.length}</span>
      </div>

      {/* CONTENEDOR DE LA LÍNEA DE TIEMPO */}
      <div className="relative">
        
        {/* Línea de Energía (Spine) perfectamente alineada al centro de los iconos */}
        <div className="absolute bottom-0 left-[19px] top-4 w-px bg-white/10" />

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
              const translatedTitle = getTranslation(item.title, isSpanish);
              const translatedDesc = getTranslation(item.description, isSpanish);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: Math.min(i, 3) * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pl-14" // Espacio exacto para esquivar la línea
                >
                  
                  {/* NODO DEL TIMELINE (Icono Flotante) */}
                  <div className="absolute left-0 top-3 w-10 h-10 bg-[#030303] rounded-full flex items-center justify-center z-10">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                       isWork 
                         ? 'border-white/20 bg-[#0b0b0c] text-white/85' 
                         : 'border-white/10 bg-[#0b0b0c] text-white/45'
                    }`}>
                      {isWork ? <Briefcase size={14} /> : <GraduationCap size={14} />}
                    </div>
                  </div>

                  {/* TARJETA DE CONTENIDO (Glassmorphism Avanzado) */}
                  <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                    
                    {/* METADATOS (Tipo y Fechas) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className={`text-[13px] ${isWork ? 'text-white/70' : 'text-white/45'}`}>
                        {isWork ? (isSpanish ? 'Profesional' : 'Professional') : (isSpanish ? 'Académico' : 'Academic')}
                      </span>

                      <div className="flex items-center gap-1.5 text-[13px] text-white/40">
                        <Calendar size={12} className="text-zinc-600" />
                        <span>{item.start_date}</span>
                        <span>—</span>
                        {item.end_date ? (
                          <span>{item.end_date}</span>
                        ) : (
                          <span className="text-rayo-red">{isSpanish ? 'Actualidad' : 'Present'}</span>
                        )}
                      </div>
                    </div>

                    {/* TÍTULO Y ORGANIZACIÓN */}
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold tracking-tight text-white leading-tight">
                        {translatedTitle}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm text-white/55">
                          {item.organization}
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    {translatedDesc && (
                      <p className="text-sm text-zinc-400 leading-relaxed font-light mt-4 whitespace-pre-wrap">
                        {translatedDesc}
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