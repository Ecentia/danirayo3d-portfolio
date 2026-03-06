'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';
import { supabase } from '@/lib/supabase';
import { Pencil, Terminal, Cpu, Fingerprint } from 'lucide-react'; 

export default function AboutMe() {
  const { isAdmin, registerChange } = useAdmin();
  
  // Estado local para la UI inmediata
  const [content, setContent] = useState({
    title: 'ARQUITECTO DE REALIDADES',
    description: 'Cargando datos del sistema...'
  });

  // 1. CARGAR DATOS AL INICIO
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_content')
        .select('title, description')
        .eq('client_slug', CURRENT_SLUG)
        .eq('section_id', 'about_me') 
        .single();
      
      if (data) {
        setContent({ title: data.title, description: data.description });
      }
    };
    fetchData();
  }, []);

  // 2. MANEJAR EL INPUT
  const handleLocalChange = (field: 'title' | 'description', value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
    registerChange('about_me', { [field]: value });
  };

  return (
    <section className="relative w-full py-32 lg:py-48 bg-[#070708] text-white overflow-hidden" id="sobre-mi">
        
        {/* --- DECORACIÓN DE FONDO (Tech / Cyberpunk) --- */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
            {/* Gradiente superior para fundido suave */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black via-[#070708]/90 to-transparent z-10" />
            
            {/* Cuadrícula base (Coherente con Experience) */}
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] [background-size:32px_32px]" />
            
            {/* Resplandor rojo asimétrico */}
            <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-800/5 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          
          {/* Cabecera del Sistema */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-16 opacity-70 font-mono text-[10px] md:text-xs text-red-500 tracking-[0.3em] uppercase"
          >
             <Cpu size={16} className="animate-pulse" />
             <span>INIT_SEQUENCE::PROFILE_ENTITY_DATA</span>
             <div className="h-[1px] flex-grow bg-gradient-to-r from-red-600/50 to-transparent ml-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* --- COLUMNA IZQUIERDA: TÍTULO --- */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              {isAdmin ? (
                <div className="relative group">
                   <textarea 
                      value={content.title}
                      onChange={(e) => handleLocalChange('title', e.target.value)}
                      className="w-full bg-[#0b0b0d]/80 text-4xl md:text-6xl font-black text-white border-l-4 border-red-600 p-6 focus:outline-none focus:bg-[#141417] uppercase resize-none font-sans backdrop-blur-md transition-all shadow-2xl shadow-red-900/10"
                      rows={4}
                   />
                   <div className="absolute top-0 right-0 bg-red-600 text-xs px-3 py-1 text-black font-bold flex gap-2 items-center pointer-events-none tracking-widest uppercase">
                     <Pencil size={12}/> Admin Mode
                   </div>
                </div>
              ) : (
                <div className="relative">
                    {/* Icono de fondo decorativo */}
                    <Fingerprint size={120} className="absolute -top-10 -left-10 text-white/[0.02] pointer-events-none -rotate-12" />
                    <h2 className="relative text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter uppercase break-words">
                      {content.title}
                      <span className="text-red-600 animate-pulse inline-block ml-1">_</span>
                    </h2>
                </div>
              )}
            </motion.div>

            {/* --- COLUMNA DERECHA: DESCRIPCIÓN (SMOKED GLASS AVANZADO) --- */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-7 group"
            >
               <div className="relative bg-[#0b0b0d]/60 backdrop-blur-xl border border-zinc-900/50 p-8 md:p-14 rounded-2xl shadow-2xl transition-all duration-700 hover:border-red-900/30 hover:bg-[#0b0b0d]/80 hover:shadow-[0_0_40px_rgba(220,38,38,0.05)] overflow-hidden">
                 
                 {/* Escáner de luz interno (Hover effect) */}
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent -translate-y-full group-hover:translate-y-[400px] transition-transform duration-[1.5s] ease-in-out opacity-0 group-hover:opacity-100" />

                 {/* Esquinas Cyberpunk */}
                 <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-600/40 rounded-tl-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 origin-top-left transition-all duration-500" />
                 <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-600/40 rounded-br-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 origin-bottom-right transition-all duration-500" />

                 {isAdmin ? (
                    <div className="relative">
                       <textarea 
                          value={content.description}
                          onChange={(e) => handleLocalChange('description', e.target.value)}
                          className="w-full h-80 bg-black/40 text-red-50/90 font-mono text-base md:text-lg border border-red-900/30 p-6 rounded-lg focus:outline-none focus:border-red-500/60 focus:bg-black/60 resize-none transition-all custom-scrollbar leading-relaxed"
                       />
                       <div className="absolute bottom-4 right-4 text-red-600 opacity-40 pointer-events-none flex items-center gap-2 font-mono text-xs">
                         <Terminal size={16} /> WAITING FOR INPUT...
                       </div>
                    </div>
                  ) : (
                    <div className="relative z-10">
                        {/* Decoración de comillas sutiles */}
                        <div className="absolute -top-6 -left-4 text-6xl text-white/[0.03] font-serif leading-none select-none pointer-events-none">"</div>
                        
                        {/* IMPORTANTE: whitespace-pre-wrap permite los saltos de línea */}
                        <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed tracking-wide whitespace-pre-wrap group-hover:text-zinc-200 transition-colors duration-500">
                          {content.description}
                        </p>
                    </div>
                  )}
               </div>
            </motion.div>
            
          </div>
        </div>
    </section>
  );
}