'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ExperienceItem } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';
import { Briefcase, GraduationCap, Plus, Trash2, Pencil, Calendar, Clock } from 'lucide-react';
import ExperienceModal from './ExperienceModal';

// === CONFIGURACIÓN MULTI-PORTFOLIO ===
const CLIENT_SLUG = 'daniel-rayo'; 

export default function Experience() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const { isAdmin, deleteItem } = useAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);

  const fetchExperience = async () => {
    const { data } = await supabase
      .from('experience')
      .select('*')
      .eq('client_slug', CLIENT_SLUG) // Filtro por cliente
      .order('display_order', { ascending: false }); // O por created_at
    if (data) setItems(data);
  };

  useEffect(() => { 
    fetchExperience(); 
  }, [isAdmin]);

  const openNewModal = () => { setEditingItem(null); setIsModalOpen(true); };
  const openEditModal = (item: ExperienceItem) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { 
    if(confirm("¿Eliminar este hito?")) {
      await deleteItem('experience', id); 
      fetchExperience(); 
    }
  };

  return (
    /* Reducimos el padding superior/inferior (py-24) para evitar huecos excesivos */
    <section className="relative w-full py-24 bg-[#050505] overflow-hidden border-t border-white/[0.02]">
       
       {/* Líneas decorativas de fondo */}
       <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-[5%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-900/40 to-transparent" />
          <div className="absolute right-[5%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-900/40 to-transparent" />
       </div>

       <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          {/* HEADER SECCIÓN */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
             <div className="space-y-3">
                <h2 className="text-red-600 font-mono text-xs tracking-[0.6em] uppercase flex items-center gap-2">
                   <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                   // SYSTEM_TRAJECTORY_LOGS
                </h2>
                <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                   EXPERIENCIA <span className="text-zinc-800">&</span> <span className="text-zinc-600">NODOS</span>
                </h3>
             </div>
             
             {isAdmin && (
                <button 
                  onClick={openNewModal}
                  className="group flex items-center gap-4 bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-500 transition-all duration-300 shadow-lg shadow-red-900/20 active:scale-95"
                >
                   <Plus size={18} className="group-hover:rotate-90 transition-transform"/> 
                   <span className="font-black text-[10px] tracking-[0.2em] uppercase">Añadir Nodo</span>
                </button>
             )}
          </div>

          {/* TIMELINE */}
          <div className="relative">
             
             {/* Eje Central del Timeline */}
             <div className="absolute left-[20px] md:left-[32px] top-6 bottom-0 w-[2px] bg-zinc-900/50">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-red-900/30 to-transparent" />
             </div>

             <div className="space-y-12">
                {items.map((item, index) => (
                   <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="relative flex gap-8 md:gap-14 group"
                   >
                      {/* Nodo Visual */}
                      <div className="flex flex-col items-center flex-shrink-0">
                         <div className="relative w-10 h-10 md:w-16 md:h-16 flex items-center justify-center bg-black border border-zinc-800 rounded-2xl z-10 group-hover:border-red-600 group-hover:bg-red-950/10 transition-all duration-500 shadow-2xl">
                            <div className="text-zinc-600 group-hover:text-red-600 transition-colors">
                               {item.type === 'work' ? <Briefcase size={20} /> : <GraduationCap size={20} />}
                            </div>
                            <div className="absolute inset-0 rounded-2xl border border-red-600/20 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500" />
                         </div>
                      </div>

                      {/* Tarjeta de Información */}
                      <div className="flex-1">
                         <div className="relative bg-zinc-900/20 backdrop-blur-xl border border-white/[0.03] p-7 md:p-10 rounded-3xl hover:border-red-600/30 transition-all duration-500 hover:bg-zinc-900/40">
                            
                            {/* Indicador Lateral */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-12 bg-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-r-full" />

                            {/* Controles Admin */}
                            {isAdmin && (
                               <div className="absolute top-6 right-6 flex gap-2 z-20">
                                  <button onClick={() => openEditModal(item)} className="p-2.5 text-zinc-500 hover:text-white bg-black/50 rounded-lg border border-white/5 hover:border-red-600 transition-all"><Pencil size={14}/></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2.5 text-zinc-500 hover:text-red-500 bg-black/50 rounded-lg border border-white/5 hover:border-red-600 transition-all"><Trash2 size={14}/></button>
                               </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-col gap-4 mb-6">
                               <div className="flex flex-wrap items-center gap-4">
                                  <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${item.type === 'work' ? 'bg-red-600/10 text-red-500 border-red-600/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>
                                     {item.type === 'work' ? 'Professional' : 'Education'}
                                  </span>
                                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                                     <Calendar size={12} className="text-red-600" /> 
                                     {item.start_date} — {item.end_date || <span className="text-red-500 font-bold animate-pulse">Presente</span>}
                                  </div>
                               </div>
                               
                               <h3 className="text-3xl md:text-4xl font-black text-white group-hover:text-red-600 transition-colors leading-none tracking-tighter uppercase italic">
                                  {item.title}
                               </h3>
                               <div className="text-lg md:text-xl text-zinc-500 font-medium">
                                  @ {item.organization}
                               </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-zinc-400 text-sm md:text-base leading-relaxed border-t border-white/5 pt-6 group-hover:text-zinc-300 transition-colors">
                               {item.description}
                            </p>

                            {/* Index Decorativo */}
                            <div className="absolute right-8 bottom-6 text-7xl font-black text-white/[0.02] pointer-events-none select-none group-hover:text-red-600/[0.03] transition-colors font-mono">
                               {index + 1 < 10 ? `0${index + 1}` : index + 1}
                            </div>
                         </div>
                      </div>
                   </motion.div>
                ))}

                {items.length === 0 && (
                   <div className="ml-24 p-12 border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-700 font-mono text-xs uppercase tracking-[0.4em] text-center">
                      [LOG_EMPTY]: No se han detectado transmisiones de trayectoria.
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