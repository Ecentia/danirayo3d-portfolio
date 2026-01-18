'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';
import { Terminal, Cpu, Zap, Edit3 } from 'lucide-react';

export default function AboutMe() {
  const { isAdmin, registerChange } = useAdmin();
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS MULTI-PORTFOLIO ---
  useEffect(() => {
    const fetchBio = async () => {
      const { data } = await supabase
        .from('portfolio_content')
        .select('content')
        .eq('client_slug', CURRENT_SLUG)
        .eq('section_id', 'about_bio')
        .single();

      if (data) {
        setBio(data.content);
      } else {
        setBio("Game Developer y Artista 3D especializado en la creación de mundos inmersivos.");
      }
      setLoading(false);
    };

    fetchBio();
  }, []);

  const handleBioChange = (newContent: string) => {
    setBio(newContent);
    registerChange('about_bio', { content: newContent });
  };

  return (
    <section id="trayectoria" className="relative w-full py-32 bg-[#050505] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LADO IZQUIERDO: LOGO IDENTITARIO */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square md:aspect-[4/5] bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden group flex items-center justify-center"
            >
              <div className="absolute inset-0 scanlines opacity-20 z-10 pointer-events-none" />
              
              {/* SUSTITUCIÓN: FAVICON EN LUGAR DE ICONO USER */}
              <div className="relative w-32 h-32 md:w-48 md:h-48 z-20">
                <img 
                  src="/favicon.ico" 
                  alt="Logo" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Badges de Información */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <Zap size={16} className="text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Status</span>
                    <span className="text-xs font-black text-white uppercase tracking-wider leading-none">Disponible</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* LADO DERECHO: CONTENIDO EDITABLE */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="text-red-600 font-mono text-xs tracking-[0.5em] uppercase flex items-center gap-3">
                <Terminal size={14} /> // PROFILE_MANIFESTO
              </h2>
              <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                CREANDO <span className="text-zinc-800">MUNDOS</span> <br />
                PÍXEL A <span className="text-red-600">PÍXEL</span>
              </h3>
            </div>

            <div className="relative">
              {isAdmin ? (
                <div className="group relative">
                  <textarea
                    value={bio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    className="w-full bg-zinc-900/30 border border-white/10 rounded-2xl p-6 text-zinc-400 text-lg leading-relaxed font-sans focus:border-red-600/50 outline-none min-h-[250px] resize-none"
                  />
                  <div className="absolute -top-3 -left-3 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={12} />
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400 text-xl md:text-2xl leading-relaxed font-medium">
                  {loading ? "Cargando..." : bio}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                  <Cpu size={20} className="text-red-600" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Entornos High-End</h4>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase">Optimización Unreal/Unity</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                  <Zap size={20} className="text-red-600" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Game Design</h4>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase">Experiencias Jugables</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}