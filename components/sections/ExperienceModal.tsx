'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, GraduationCap, Check, Calendar } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { ExperienceItem } from '@/types/database';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: ExperienceItem | null;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function ExperienceModal({ isOpen, onClose, itemToEdit }: ExperienceModalProps) {
  const { registerNewExperience, registerChange, notify, setIsModalOpen } = useAdmin();
  
  // Estado base
  const [type, setType] = useState<'work' | 'education'>('work');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');

  // Estados de Fechas separados
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  // --- CONTROL DE HEADER Y SCROLL ---
  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsModalOpen(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, setIsModalOpen]);

  // --- FIX: CIERRE AL NAVEGAR (HASH CHANGE) ---
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) onClose();
    };
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, [isOpen, onClose]);

  // Cargar datos si es edición
  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setTitle(itemToEdit.title);
      setOrganization(itemToEdit.organization);
      setDescription(itemToEdit.description);

      // Parsear fecha de inicio (Ej: "Enero 2023" o "2023")
      const startParts = itemToEdit.start_date.split(' ');
      if (startParts.length > 1) {
        setStartMonth(startParts[0]);
        setStartYear(startParts[1]);
      } else {
        setStartYear(itemToEdit.start_date);
      }

      // Parsear fecha fin
      if (!itemToEdit.end_date) {
        setIsCurrent(true);
      } else {
        setIsCurrent(false);
        const endParts = itemToEdit.end_date.split(' ');
        if (endParts.length > 1) {
          setEndMonth(endParts[0]);
          setEndYear(endParts[1]);
        } else {
          setEndYear(itemToEdit.end_date);
        }
      }
    } else {
      resetForm();
    }
  }, [itemToEdit, isOpen]);

  const resetForm = () => {
    setType('work');
    setTitle('');
    setOrganization('');
    setDescription('');
    setStartMonth('');
    setStartYear('');
    setEndMonth('');
    setEndYear('');
    setIsCurrent(false);
  };

  const handleSubmit = () => {
    if (!title || !organization || !startYear) {
      notify("Falta el Título, Organización o el Año de Inicio", "error");
      return;
    }

    const finalStartDate = startMonth ? `${startMonth} ${startYear}` : `${startYear}`;
    
    let finalEndDate = null;
    if (!isCurrent && endYear) {
      finalEndDate = endMonth ? `${endMonth} ${endYear}` : `${endYear}`;
    }

    const payload = {
      type,
      title,
      organization,
      description,
      start_date: finalStartDate,
      end_date: finalEndDate,
    };

    if (itemToEdit) {
      registerChange(`exp_${itemToEdit.id}`, payload);
      notify("Cambio registrado localmente", "success");
    } else {
      registerNewExperience({
        ...payload,
        id: `temp-${Date.now()}`,
        display_order: 0
      });
    }
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#050505] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-zinc-900/50 p-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-red-600 font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              {type === 'work' ? <Briefcase size={14}/> : <GraduationCap size={14}/>}
              {itemToEdit ? 'NODE_EDIT_MODE' : 'NEW_TIMELINE_NODE'}
            </h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Selector de Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setType('work')}
                className={`py-3 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all flex justify-center items-center gap-2
                  ${type === 'work' ? 'border-red-600 bg-red-600/10 text-white' : 'border-white/5 text-zinc-600 hover:border-white/10'}
                `}
              >
                <Briefcase size={14}/> Experiencia
              </button>
              <button 
                onClick={() => setType('education')}
                className={`py-3 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all flex justify-center items-center gap-2
                  ${type === 'education' ? 'border-red-600 bg-red-600/10 text-white' : 'border-white/5 text-zinc-600 hover:border-white/10'}
                `}
              >
                <GraduationCap size={14}/> Formación
              </button>
            </div>

            {/* Inputs Principales */}
            <div className="space-y-5">
                <div className="group">
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">Rol / Título</label>
                    <input 
                      placeholder="Ej: Senior 3D Artist"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-red-600 outline-none transition-all"
                    />
                </div>
                <div className="group">
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">Organización / Centro</label>
                    <input 
                      placeholder="Ej: Ecentia Studios"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-red-600 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Configuración de Fechas */}
            <div className="bg-zinc-900/20 p-5 rounded-2xl border border-white/5 space-y-5">
                <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Calendar size={12}/> Configuración Temporal
                </div>
                
                {/* INICIO */}
                <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Fecha de Inicio</div>
                    <div className="col-span-6">
                        <select 
                            value={startMonth} 
                            onChange={(e) => setStartMonth(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-red-600 appearance-none"
                        >
                            <option value="">Mes (Opt)</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="col-span-6">
                        <input 
                            type="number" 
                            placeholder="Año" 
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-red-600"
                        />
                    </div>
                </div>

                {/* FIN */}
                <div className="grid grid-cols-12 gap-3 items-end pt-4 border-t border-white/5">
                     <div className="col-span-12 flex justify-between items-center mb-1">
                        <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Fecha de Finalización</span>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={isCurrent} 
                                onChange={(e) => setIsCurrent(e.target.checked)}
                                className="accent-red-600 w-3 h-3"
                            />
                            <span className="text-[9px] text-red-500/70 group-hover:text-red-500 font-mono uppercase transition-colors">Actualmente</span>
                        </label>
                     </div>
                     
                     {!isCurrent && (
                        <>
                            <div className="col-span-6">
                                <select 
                                    value={endMonth} 
                                    onChange={(e) => setEndMonth(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-red-600 appearance-none"
                                >
                                    <option value="">Mes (Opt)</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="col-span-6">
                                <input 
                                    type="number" 
                                    placeholder="Año" 
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-red-600"
                                />
                            </div>
                        </>
                     )}
                </div>
            </div>

            <div className="group">
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest group-focus-within:text-red-500 transition-colors">Descripción</label>
                <textarea 
                  placeholder="Detalla tus responsabilidades o logros clave..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:border-red-600 outline-none min-h-[120px] resize-none transition-all"
                />
            </div>

            <button 
              onClick={handleSubmit}
              className="mt-2 w-full bg-white text-black hover:bg-red-600 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98]"
            >
              <Check size={16} /> {itemToEdit ? 'ACTUALIZAR NODO' : 'REGISTRAR TRAYECTORIA'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}