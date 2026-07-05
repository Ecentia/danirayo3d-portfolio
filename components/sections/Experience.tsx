'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ExperienceItem } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';
import { Briefcase, GraduationCap, Plus, Trash2, Pencil, Calendar, ArrowRight } from 'lucide-react';
import ExperienceModal from './ExperienceModal';
import { useLanguage } from '@/context/LanguageContext';

const getTranslation = (value: string | null, isSpanish: boolean): string => {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return (isSpanish ? parsed.es : parsed.en) || parsed.en || parsed.es || value;
    }
  } catch (e) {}
  return value;
};

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
    const [loading, setLoading] = useState(true);
    const { isAdmin, deleteItem, notify } = useAdmin();
    const { isSpanish } = useLanguage();
    
    // Control del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);

    // Fetch a la base de datos
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

    // Handlers
    const openNewModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: ExperienceItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin || !confirm(isSpanish ? "¿Estás seguro de eliminar este nodo?" : "Are you sure you want to delete this node?")) return;
        deleteItem('experience', id);
        setItems(prev => prev.filter(item => item.id !== id));
        notify(isSpanish ? "Nodo marcado para eliminación." : "Node marked for deletion.", "info");
    };

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
                            {isSpanish ? "Experiencia" : "Career"} <span className="text-zinc-800">{isSpanish ? "Profesional" : "Timeline"}</span>
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
                            <span className="text-sm tracking-tight">{isSpanish ? "Añadir Nuevo Nodo" : "Insert New Data Node"}</span>
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
                                                
                                                {/* Efecto de anillo orbital holográfico al pasar el ratón */}
                                                <div className="absolute inset-0 border border-zinc-800 rounded-full group-hover:border-red-500/50 group-hover:scale-110 transition-all duration-500 ease-out z-0" />
                                                
                                                <div className={`w-[32px] h-[32px] md:w-[56px] md:h-[56px] rounded-full border flex items-center justify-center transition-all duration-300 ${
                                                    item.type === 'work' 
                                                      ? 'border-red-500/30 bg-red-950/10 text-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)] group-hover:border-red-500 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                                                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 group-hover:border-white group-hover:text-white'
                                                }`}>
                                                    {item.type === 'work' ? <Briefcase size={22} className="md:w-7 md:h-7"/> : <GraduationCap size={22} className="md:w-7 md:h-7"/>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- COLUMNA DERECHA: LA TARJETA --- */}
                                        <motion.div 
                                          style={{ rotateX, rotateY }}
                                          className="flex-grow bg-zinc-950/40 border border-zinc-900 group-hover:border-white/10 group-hover:bg-[#0b0b0d]/70 transition-all duration-500 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-sm"
                                        >
                                            {/* Efecto Cyber Glitch en las esquinas */}
                                            <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {/* CONTENIDO INTERNO */}
                                            <div className="relative z-10">
                                                
                                                {/* METADATOS TÉCNICOS */}
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-6">
                                                    
                                                    {/* Botones de acción exclusiva del Administrador */}
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-2 mr-2">
                                                            <button onClick={() => openEditModal(item)} className="p-2.5 text-zinc-600 hover:text-white bg-black border border-zinc-800 hover:border-zinc-700 transition-all rounded-lg backdrop-blur-sm"><Pencil size={15}/></button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-2.5 text-zinc-600 hover:text-red-500 bg-black border border-zinc-800 hover:border-red-900 transition-all rounded-lg backdrop-blur-sm"><Trash2 size={15}/></button>
                                                        </div>
                                                    )}

                                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${item.type === 'work' ? 'bg-blue-950/40 text-blue-400 border border-blue-900' : 'bg-green-950/40 text-green-400 border border-green-900'}`}>
                                                        {item.type === 'work' ? (isSpanish ? 'DESPLIEGUE::PROFESIONAL' : 'DEPLOYMENT::PROFESSIONAL') : (isSpanish ? 'ARCHIVO::REGISTRO_ACADÉMICO' : 'ARCHIVE::ACADEMIC_RECORD')}
                                                    </span>
                                                    <span className="text-zinc-800">|</span>
                                                    <span className="text-zinc-500 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                                                        <Calendar size={13}/> 
                                                        {item.start_date} <ArrowRight size={12} className="text-zinc-700"/> {item.end_date || <span className="text-red-500 font-bold">{isSpanish ? 'SESIÓN_ACTIVA' : 'ACTIVE_SESSION'}</span>}
                                                    </span>
                                                </div>

                                                {/* TÍTULO Y ORGANIZACIÓN */}
                                                <div className="flex flex-col gap-2 mb-8">
                                                    <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter group-hover:text-red-500 transition-colors duration-300">
                                                        {getTranslation(item.title, isSpanish)}
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
                                                    {getTranslation(item.description, isSpanish)}
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
                    </div>
                </div>
            </div>

            {/* Modal para Edición / Creación */}
            <ExperienceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                itemToEdit={editingItem}
            />

        </section>
    );
}