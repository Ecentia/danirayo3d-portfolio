'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';
import { supabase } from '@/lib/supabase';
import { Pencil, Terminal, Cpu } from 'lucide-react'; 

export default function AboutMe() {
  const { isAdmin, registerChange } = useAdmin();
  
  // Estado local para la UI inmediata
  const [content, setContent] = useState({
    title: 'ARQUITECTO DE REALIDADES',
    description: 'Soy Daniel Rayo. Mi código no solo compila, respira...'
  });

  // 1. CARGAR DATOS AL INICIO
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_content')
        .select('title, description')
        .eq('client_slug', CURRENT_SLUG)
        .eq('section_id', 'about_me') // Identificador único para esta sección
        .single();
      
      if (data) {
        setContent({ title: data.title, description: data.description });
      }
    };
    fetchData();
  }, []);

  // 2. MANEJAR EL INPUT (Solo actualiza estado local y avisa al contexto)
  const handleLocalChange = (field: 'title' | 'description', value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
    // Registramos que 'about_me' tiene un cambio pendiente
    registerChange('about_me', { [field]: value });
  };

  return (
    <section className="relative w-full py-32 bg-black text-white overflow-hidden">
        {/* --- DECORACIÓN DE FONDO --- */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,0,0,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,0,0,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          
          {/* Cabecera decorativa */}
          <div className="flex items-center gap-2 mb-12 opacity-50 font-mono text-xs text-red-500 tracking-[0.3em]">
             <Cpu size={14} /><span>SYSTEM_MODULE: PROFILE_DATA</span>
             <div className="h-[1px] flex-grow bg-gradient-to-r from-red-900 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* --- TÍTULO --- */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 relative"
            >
              {isAdmin ? (
                <div className="relative group">
                   <textarea 
                      value={content.title}
                      onChange={(e) => handleLocalChange('title', e.target.value)}
                      className="w-full bg-black/50 text-5xl font-black text-white border-l-4 border-red-600 p-4 focus:outline-none focus:bg-red-950/20 uppercase resize-none font-sans"
                      rows={3}
                   />
                   <div className="absolute top-0 right-0 bg-red-600 text-xs px-2 py-1 text-black font-bold flex gap-1 items-center pointer-events-none">
                     <Pencil size={12}/> EDIT MODE
                   </div>
                </div>
              ) : (
                <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                  {content.title}<span className="text-red-600">.</span>
                </h2>
              )}
            </motion.div>

            {/* --- DESCRIPCIÓN --- */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7"
            >
               <div className="bg-red-950/5 border border-red-900/30 p-8 md:p-12 relative backdrop-blur-sm">
                 {/* Esquinas decorativas */}
                 <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500"></div>
                 <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-500"></div>
                 <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-red-500"></div>
                 <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500"></div>

                 {isAdmin ? (
                    <div className="relative group">
                       <textarea 
                          value={content.description}
                          onChange={(e) => handleLocalChange('description', e.target.value)}
                          className="w-full h-64 bg-black text-red-100 font-mono text-lg border border-red-900/50 p-6 focus:outline-none focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,0,0,0.1)] resize-none"
                       />
                       <div className="absolute bottom-4 right-4 text-red-500 opacity-50 pointer-events-none">
                         <Terminal size={20} />
                       </div>
                    </div>
                  ) : (
                    <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed tracking-wide">
                      {content.description}
                    </p>
                  )}
               </div>
            </motion.div>
            
          </div>
        </div>
    </section>
  );
}