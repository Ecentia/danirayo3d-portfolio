'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';
import { 
  Plus, 
  Trash2, 
  Terminal, 
  Settings2, 
  Cpu,
  Monitor,
  Box
} from 'lucide-react';

// --- MAPEO DE ICONOS DE SOFTWARE ---
import { 
  SiAdobeaftereffects, SiBlender, SiAutodeskmaya, SiAdobephotoshop, 
  SiUnity, SiAdobepremierepro, SiAseprite, SiKrita, SiUnrealengine 
} from 'react-icons/si';

const iconMap: Record<string, any> = {
  'After Effects': SiAdobeaftereffects,
  'Blender': SiBlender,
  'Maya': SiAutodeskmaya,
  'Photoshop': SiAdobephotoshop,
  'Unity': SiUnity,
  'Unreal Engine': SiUnrealengine,
  'Premiere': SiAdobepremierepro,
  'Aseprite': SiAseprite,
  'Krita': SiKrita,
};

interface TechItem {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

export default function TechStack() {
  const { isAdmin, deleteItem, notify } = useAdmin();
  const [techs, setTechs] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTech = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('client_slug', CURRENT_SLUG)
      .order('category', { ascending: true });

    if (data) setTechs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTech();
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    await deleteItem('tech_stack', id);
    fetchTech();
  };

  // Agrupar por categoría
  const categories = Array.from(new Set(techs.map(t => t.category)));

  return (
    <section id="tech-stack" className="relative w-full py-24 bg-[#050505] border-t border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER SECCIÓN */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-red-600 font-mono text-xs tracking-[0.6em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              // HARDWARE_&_SOFTWARE_ARSENAL
            </h2>
            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
              TECH <span className="text-zinc-800">STACK</span>
            </h3>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest hidden sm:block">
                  [Sincronizado_con_Admin_Panel]
               </span>
               <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500">
                  <Settings2 size={18} />
               </div>
            </div>
          )}
        </div>

        {/* REJILLA DE CATEGORÍAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-zinc-900/20 rounded-3xl border border-white/5 animate-pulse" />
            ))
          ) : (
            categories.map((cat, catIdx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-zinc-900/20 backdrop-blur-sm border border-white/[0.05] p-8 rounded-3xl hover:border-red-600/30 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-lg border border-white/10 group-hover:border-red-600/50 transition-colors">
                      {cat === '3D Modeling' ? <Box size={16} className="text-red-500" /> : <Monitor size={16} className="text-red-500" />}
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">{cat}</h4>
                  </div>
                  <div className="h-[1px] flex-1 bg-white/5 mx-4" />
                </div>

                <div className="space-y-6">
                  {techs.filter(t => t.category === cat).map((tech) => {
                    const Icon = iconMap[tech.name] || Terminal;
                    return (
                      <div key={tech.id} className="relative group/item flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 group-hover/item:border-red-600/40 transition-all">
                            <Icon size={20} className="text-zinc-400 group-hover/item:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">{tech.name}</span>
                               <span className="text-[9px] font-mono text-zinc-600">{tech.proficiency}%</span>
                            </div>
                            {/* Barra de Progreso Cyberpunk */}
                            <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${tech.proficiency}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                              />
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(tech.id)}
                            className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* FOOTER SECCIÓN / DECORACIÓN */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale">
            <div className="flex gap-12 grayscale opacity-40 items-center overflow-hidden w-full justify-center">
                {/* Repetimos logos para un efecto de scroll infinito sutil o simple grid */}
                {Object.values(iconMap).slice(0, 6).map((Icon, i) => (
                    <Icon key={i} size={32} className="shrink-0" />
                ))}
            </div>
        </div>
      </div>

      {/* Glow de fondo decorativo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-red-600/[0.02] to-transparent pointer-events-none" />
    </section>
  );
}