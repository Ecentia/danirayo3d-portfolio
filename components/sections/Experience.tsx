'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ExperienceItem } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';
import { Briefcase, GraduationCap, Plus, Trash2, Pencil, Calendar, ChevronRight } from 'lucide-react';
import ExperienceModal from './ExperienceModal';

export default function Experience() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const { isAdmin, deleteItem } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);

  const fetchExperience = async () => {
    const { data } = await supabase
      .from('experience')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => { fetchExperience(); }, [isAdmin]);

  const openNewModal = () => { setEditingItem(null); setIsModalOpen(true); };
  const openEditModal = (item: ExperienceItem) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { await deleteItem('experience', id); fetchExperience(); };

  return (
    // CAMBIO: bg-black -> bg-[#09090b] (Obsidiana)
    <section className="relative w-full py-32 bg-[#09090b] text-white overflow-hidden">
        {/* Fondo decorativo sutil */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute left-[10%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-900/20 to-transparent" />
           <div className="absolute right-[10%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-900/20 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          {/* HEADER SECCIÓN */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
             <div className="space-y-2">
                <h2 className="text-red-600 font-mono text-xs tracking-[0.5em] uppercase animate-pulse">
                   // SYSTEM_LOGS
                </h2>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                   TRAYECTORIA <span className="text-white/10">DATA</span>
                </h3>
             </div>
             
             {isAdmin && (
                <button 
                  onClick={openNewModal}
                  className="group flex items-center gap-3 bg-red-600/10 border border-red-600/50 text-red-500 px-6 py-3 hover:bg-red-600 hover:text-white transition-all duration-300 rounded-sm"
                >
                   <Plus size={16} className="group-hover:rotate-90 transition-transform"/> 
                   <span className="font-mono text-xs font-bold tracking-widest">ADD_NEW_NODE</span>
                </button>
             )}
          </div>

          {/* TIMELINE CONTAINER */}
          <div className="relative">
             
             {/* LÍNEA VERTICAL CENTRAL (El "Spine") */}
             <div className="absolute left-[19px] md:left-[31px] top-4 bottom-0 w-[2px] bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-red-900/50 to-transparent w-full h-full" />
             </div>

             <div className="space-y-16">
                {items.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="relative flex gap-8 md:gap-12"
                    >
                      {/* COLUMNA IZQUIERDA: EL "NODO" */}
                      <div className="flex flex-col items-center flex-shrink-0">
                         {/* El Punto/Nodo */}
                         <div className="relative w-10 h-10 md:w-16 md:h-16 flex items-center justify-center bg-black border border-zinc-800 rounded-full z-10 group-hover:border-red-500 transition-colors duration-500 shadow-[0_0_20px_rgba(0,0,0,1)]">
                            {/* Icono interior */}
                            <div className="text-zinc-500 group-hover:text-red-500 transition-colors">
                               {item.type === 'work' ? <Briefcase size={18} /> : <GraduationCap size={18} />}
                            </div>
                            {/* Anillo brillante externo */}
                            <div className="absolute inset-0 rounded-full border border-red-600/30 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                         </div>
                      </div>

                      {/* COLUMNA DERECHA: LA TARJETA (Glass Style) */}
                      <div className="flex-1 group">
                         {/* CAMBIO: bg-zinc-900/40 -> bg-white/5 con backdrop-blur */}
                         <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 hover:border-red-500/30 transition-all duration-500 hover:bg-white/[0.08] overflow-hidden rounded-sm">
                            
                            {/* Decoración Cyberpunk en esquinas */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Barra lateral roja al hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                            {/* Controles Admin */}
                            {isAdmin && (
                               <div className="absolute top-4 right-4 flex gap-2 z-20">
                                  <button onClick={() => openEditModal(item)} className="p-2 text-zinc-500 hover:text-white bg-black/40 hover:bg-zinc-800 transition-colors rounded-sm backdrop-blur-sm"><Pencil size={14}/></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-500 bg-black/40 hover:bg-zinc-800 transition-colors rounded-sm backdrop-blur-sm"><Trash2 size={14}/></button>
                               </div>
                            )}

                            {/* Contenido Header */}
                            <div className="flex flex-col gap-2 mb-6">
                               <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-wider">
                                  <span className={`px-2 py-1 ${item.type === 'work' ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' : 'bg-green-900/20 text-green-400 border border-green-900/30'}`}>
                                     {item.type === 'work' ? 'PROFESSIONAL_EXP' : 'ACADEMIC_RECORD'}
                                  </span>
                                  <span className="text-white/10">//</span>
                                  <span className="text-red-500 flex items-center gap-1">
                                     <Calendar size={12}/> 
                                     {item.start_date} — {item.end_date || <span className="animate-pulse font-bold text-red-400">PRESENT</span>}
                                  </span>
                               </div>
                               
                               <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-red-500 transition-colors duration-300">
                                  {item.title}
                               </h3>
                               <div className="text-lg text-zinc-400 font-mono">
                                  @ {item.organization}
                               </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4 group-hover:text-zinc-300 transition-colors">
                               {item.description}
                            </p>

                            {/* Decoración fondo número */}
                            <div className="absolute right-4 bottom-4 text-6xl font-black text-white/5 pointer-events-none select-none group-hover:text-red-600/5 transition-colors">
                               0{items.length - index}
                            </div>
                         </div>
                      </div>
                    </motion.div>
                ))}

                {items.length === 0 && (
                    <div className="ml-20 p-8 border border-dashed border-zinc-800 text-zinc-600 font-mono text-sm bg-white/5 backdrop-blur-sm">
                       [SYSTEM MESSAGE]: NO DATA STREAMS FOUND. PLEASE INITIALIZE NEW NODE.
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Modal System */}
        <ExperienceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          itemToEdit={editingItem}
        />
    </section>
  );
}