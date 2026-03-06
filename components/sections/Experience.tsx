'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ExperienceItem } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';
import { Briefcase, GraduationCap, Plus, Trash2, Pencil, Calendar, ArrowRight } from 'lucide-react';
import ExperienceModal from './ExperienceModal';

// Componente para la línea central animada ("Conducto de Energía")
const AnimatedSpine = () => {
    return (
        <div className="absolute left-[20px] md:left-[39px] top-4 bottom-0 w-[2px] bg-zinc-900 overflow-hidden rounded-full">
            <motion.div
                className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-red-500 to-transparent"
                animate={{
                    y: ['-100%', '100%']
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    );
};

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
        <section className="relative w-full py-40 bg-[#070708] text-white overflow-hidden">
            
            {/* --- FONDO ESPECTACULAR: GRID Y LUCES --- */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                {/* Patrón de cuadrícula tipo terminal */}
                <div className="absolute inset-0 [background-image:linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] [background-size:32px_32px]" />
                
                {/* Viñeteado y desenfoque radial central */}
                <div className="absolute inset-0 bg-[#070708] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                
                {/* Luces rojas difusas (Glow Atmosphere) */}
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-red-900/30 rounded-full blur-[160px]" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-red-900/20 rounded-full blur-[160px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* --- HEADER SECCIÓN REDISEÑADO --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-32 gap-8 border-b border-zinc-900 pb-12">
                    <div className="space-y-3">
                        <motion.div 
                          initial={{opacity: 0}} whileInView={{opacity: 1}} viewport={{once:true}} transition={{duration: 1}}
                          className="flex items-center gap-3"
                        >
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                          <h2 className="text-red-500 font-mono text-sm tracking-[0.4em] uppercase">
                              SYSTEM_ARCHIVE::EXPERIENCE_LOGS
                          </h2>
                        </motion.div>
                        
                        <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                            Career <span className="text-zinc-800">Timeline</span>
                        </h3>
                    </div>
                    
                    {isAdmin && (
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openNewModal}
                            className="group flex items-center gap-3 bg-white text-black px-8 py-4 hover:bg-red-600 hover:text-white transition-all duration-300 rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300"/> 
                            <span className="text-sm tracking-tight">Insert New Data Node</span>
                        </motion.button>
                    )}
                </div>

                {/* --- CONTENEDOR CENTRAL DEL TIMELINE --- */}
                <div className="relative max-w-5xl mx-auto">
                    
                    <AnimatedSpine />

                    <div className="space-y-24">
                        {items.map((item, index) => {
                            // Usamos este componente interno para mantener el estado de Framer Motion por cada tarjeta
                            const CardWithTilt = () => {
                                const cardRef = useRef<HTMLDivElement>(null);
                                const x = useMotionValue(0);
                                const y = useMotionValue(0);
                                const rotateX = useTransform(y, [-100, 100], [7, -7]);
                                const rotateY = useTransform(x, [-100, 100], [-7, 7]);

                                const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
                                    if (!cardRef.current) return;
                                    const rect = cardRef.current.getBoundingClientRect();
                                    x.set((event.clientX - rect.left) / rect.width * 200 - 100);
                                    y.set((event.clientY - rect.top) / rect.height * 200 - 100);
                                };

                                return (
                                    <motion.div 
                                      ref={cardRef}
                                      initial={{ opacity: 0, y: 60 }}
                                      whileInView={{ opacity: 1, y: 0 }}
                                      viewport={{ once: true, margin: "-100px" }}
                                      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                      className="relative flex gap-8 md:gap-14 group"
                                      onMouseMove={handleMouseMove}
                                      onMouseLeave={() => { x.set(0); y.set(0); }}
                                      style={{ perspective: 1200 }}
                                    >
                                        {/* --- COLUMNA IZQUIERDA: EL NODO --- */}
                                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                                            <div className="relative w-[42px] h-[42px] md:w-[80px] md:h-[80px] flex items-center justify-center z-10">
                                                
                                                {/* Efecto de pulso de fondo (Glow) */}
                                                <div className="absolute inset-0 bg-red-600 rounded-full scale-100 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 animate-pulse-slow" />
                                                
                                                {/* Círculo central (Socket) */}
                                                <div className="absolute inset-2 md:inset-4 bg-black border-2 border-zinc-800 rounded-full z-10 group-hover:border-red-500 transition-colors duration-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,1)]">
                                                    <div className="text-zinc-600 group-hover:text-red-500 transition-colors duration-500 scale-100 group-hover:scale-110">
                                                        {item.type === 'work' ? <Briefcase size={22} className="md:w-7 md:h-7"/> : <GraduationCap size={22} className="md:w-7 md:h-7"/>}
                                                    </div>
                                                </div>

                                                {/* Anillo exterior decorativo */}
                                                <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-40 group-hover:opacity-100 group-hover:text-red-600 transition-all duration-700" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="10 6" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* --- COLUMNA DERECHA: LA TARJETA (CON EFECTO 3D TILT) --- */}
                                        <motion.div 
                                          className="flex-1"
                                          style={{ rotateX, rotateY }} // Aplicamos la rotación 3D
                                        >
                                            <div className="relative bg-[#0b0b0d] backdrop-blur-sm border border-zinc-900 p-8 md:p-10 rounded-2xl transition-all duration-500 group-hover:border-red-900/50 group-hover:shadow-[0_20px_50px_rgba(239,68,68,0.1)] overflow-hidden">
                                                
                                                {/* DECORACIONES CYBERPUNK EN ESQUINAS (solo hover) */}
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />

                                                {/* BARRA LATERAL ANIMADA */}
                                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center rounded-r-full" />

                                                {/* CONTROLES ADMIN (SUPERPUESTOS) */}
                                                {isAdmin && (
                                                    <div className="absolute top-6 right-6 flex gap-2.5 z-20">
                                                        <button onClick={() => openEditModal(item)} className="p-2.5 text-zinc-600 hover:text-white bg-black border border-zinc-800 hover:border-zinc-600 transition-all rounded-lg backdrop-blur-sm"><Pencil size={15}/></button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-2.5 text-zinc-600 hover:text-red-500 bg-black border border-zinc-800 hover:border-red-900 transition-all rounded-lg backdrop-blur-sm"><Trash2 size={15}/></button>
                                                    </div>
                                                )}

                                                {/* METADATOS TÉCNICOS (Tipo y Fecha) */}
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-mono tracking-widest mb-8 border-b border-zinc-900 pb-6">
                                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${item.type === 'work' ? 'bg-blue-950/40 text-blue-400 border border-blue-900' : 'bg-green-950/40 text-green-400 border border-green-900'}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        {item.type === 'work' ? 'DEPLOYMENT::PROFESSIONAL' : 'ARCHIVE::ACADEMIC_RECORD'}
                                                    </span>
                                                    <span className="text-zinc-800">|</span>
                                                    <span className="text-zinc-500 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                                                        <Calendar size={13}/> 
                                                        {item.start_date} <ArrowRight size={12} className="text-zinc-700"/> {item.end_date || <span className="text-red-500 font-bold">ACTIVE_SESSION</span>}
                                                    </span>
                                                </div>

                                                {/* TÍTULO Y ORGANIZACIÓN */}
                                                <div className="flex flex-col gap-2 mb-8">
                                                    <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter group-hover:text-red-500 transition-colors duration-300">
                                                        {item.title}
                                                    </h3>
                                                    
                                                    {/* DISEÑO ORGANIZACIÓN: Línea y Texto Mono */}
                                                    <div className="flex items-center gap-4 mt-1.5">
                                                        <span className="w-8 h-[1px] bg-red-600 group-hover:w-12 transition-all duration-500"></span>
                                                        <span className="text-base text-zinc-400 font-mono tracking-wider uppercase group-hover:text-white transition-colors">
                                                            {item.organization}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* DESCRIPCIÓN (Con soporte para saltos de línea) */}
                                                <p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap font-sans group-hover:text-white transition-colors duration-300">
                                                    {item.description}
                                                </p>
                                                
                                                {/* Número de nodo decorativo de fondo */}
                                                <div className="absolute -right-4 -bottom-8 text-[120px] font-black text-[#0f0f11] pointer-events-none select-none group-hover:text-red-950/30 transition-colors duration-700 font-mono">
                                                   {String(items.length - index).padStart(2, '0')}
                                                </div>

                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            };
                            return <CardWithTilt key={item.id} />;
                        })}

                        {items.length === 0 && (
                            <div className="ml-24 p-12 border-2 border-dashed border-zinc-800 text-zinc-700 font-mono text-center rounded-2xl bg-[#0b0b0d]">
                               [SYSTEM_MESSAGE]: NO DATA STREAMS DETECTED. AWATING INPUT...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sistema de Modales */}
            <ExperienceModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                itemToEdit={editingItem}
            />
        </section>
    );
}