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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ExperienceModal({ isOpen, onClose, itemToEdit }: ExperienceModalProps) {
  const { registerNewExperience, registerChange, notify } = useAdmin();
  
  // Estado base
  const [type, setType] = useState<'work' | 'education'>('work');
  const [titleEn, setTitleEn] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [organization, setOrganization] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descEs, setDescEs] = useState('');

  // Estados de Fechas separados
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  // Tab para el idioma de edición
  const [modalLang, setModalLang] = useState<'en' | 'es'>('en');

  // Cargar datos si es edición
  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type || 'work');
      setOrganization(itemToEdit.organization || '');

      // Parsear título
      const tVal = itemToEdit.title || '';
      try {
        const parsed = JSON.parse(tVal);
        if (parsed && typeof parsed === 'object') {
          setTitleEn(parsed.en || '');
          setTitleEs(parsed.es || '');
        } else {
          setTitleEn(tVal);
          setTitleEs('');
        }
      } catch (e) {
        setTitleEn(tVal);
        setTitleEs('');
      }

      // Parsear descripción
      const dVal = itemToEdit.description || '';
      try {
        const parsed = JSON.parse(dVal);
        if (parsed && typeof parsed === 'object') {
          setDescEn(parsed.en || '');
          setDescEs(parsed.es || '');
        } else {
          setDescEn(dVal);
          setDescEs('');
        }
      } catch (e) {
        setDescEn(dVal);
        setDescEs('');
      }

      // Parsear fecha de inicio (Ej: "Enero 2023" o "2023")
      if (itemToEdit.start_date) {
        const startParts = itemToEdit.start_date.split(' ');
        if (startParts.length > 1) {
          setStartMonth(startParts[0]);
          setStartYear(startParts[1]);
        } else {
          setStartYear(itemToEdit.start_date);
        }
      } else {
        setStartMonth('');
        setStartYear('');
      }

      // Parsear fecha fin
      if (!itemToEdit.end_date) {
        setIsCurrent(true);
        setEndMonth('');
        setEndYear('');
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
      // Reset para nueva entrada
      resetForm();
    }
  }, [itemToEdit, isOpen]);

  const resetForm = () => {
    setType('work');
    setTitleEn('');
    setTitleEs('');
    setOrganization('');
    setDescEn('');
    setDescEs('');
    setStartMonth('');
    setStartYear('');
    setEndMonth('');
    setEndYear('');
    setIsCurrent(false);
    setModalLang('en');
  };

  const handleSubmit = () => {
    // 1. Validación: El año de inicio es OBLIGATORIO
    if ((modalLang === 'en' ? !titleEn : !titleEs) || !organization || !startYear) {
      notify("Falta el Título, Organización o el Año de Inicio", "error");
      return;
    }

    // 2. Construir strings de fecha
    const finalStartDate = startMonth ? `${startMonth} ${startYear}` : `${startYear}`;
    
    let finalEndDate = null;
    if (!isCurrent) {
       if (endYear) {
         finalEndDate = endMonth ? `${endMonth} ${endYear}` : `${endYear}`;
       }
    }

    // Empaquetar bilingüe
    const serializedTitle = JSON.stringify({ en: titleEn, es: titleEs });
    const serializedDesc = JSON.stringify({ en: descEn, es: descEs });

    const payload = {
      type,
      title: serializedTitle,
      organization,
      description: serializedDesc,
      start_date: finalStartDate,
      end_date: finalEndDate,
    };

    if (itemToEdit && itemToEdit.id && !itemToEdit.id.startsWith('temp-')) {
      registerChange(`exp_${itemToEdit.id}`, payload);
      notify("Cambio registrado. Guarda para confirmar.", "success");
    } else {
      registerNewExperience({
        ...payload,
        id: (itemToEdit && itemToEdit.id) || `temp-${Date.now()}`,
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#0a0a0a] border border-red-900/30 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-red-950/20 p-4 border-b border-red-900/20 flex justify-between items-center">
            <h3 className="text-red-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              {type === 'work' ? <Briefcase size={14}/> : <GraduationCap size={14}/>}
              {itemToEdit ? 'EDIT NODE DATA' : 'NEW TRAJECTORY NODE'}
            </h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18}/></button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setType('work')}
                className={`py-3 text-xs font-mono uppercase border rounded transition-all flex justify-center items-center gap-2
                  ${type === 'work' ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                `}
              >
                <Briefcase size={14}/> Experience
              </button>
              <button 
                onClick={() => setType('education')}
                className={`py-3 text-xs font-mono uppercase border rounded transition-all flex justify-center items-center gap-2
                  ${type === 'education' ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                `}
              >
                <GraduationCap size={14}/> Education
              </button>
            </div>

            {/* TAB SELECTION FOR LANGUAGES (ES / EN) */}
            <div className="flex border-b border-zinc-800 pb-1 justify-start gap-4">
               <button 
                 onClick={() => setModalLang('en')}
                 className={`px-3 py-1 text-xs font-mono font-bold tracking-widest transition-all ${
                   modalLang === 'en' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'
                 }`}
               >
                 EN
               </button>
               <button 
                 onClick={() => setModalLang('es')}
                 className={`px-3 py-1 text-xs font-mono font-bold tracking-widest transition-all ${
                   modalLang === 'es' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-white'
                 }`}
               >
                 ES
               </button>
            </div>

            {/* Inputs Principales */}
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">
                      {modalLang === 'en' ? "Role / Title" : "Rol / Puesto"}
                    </label>
                    <input 
                      placeholder={modalLang === 'en' ? "e.g. Senior 3D Artist" : "Ej: Artista 3D Senior"}
                      value={modalLang === 'en' ? titleEn : titleEs}
                      onChange={(e) => modalLang === 'en' ? setTitleEn(e.target.value) : setTitleEs(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">
                      {modalLang === 'en' ? "Organization / School" : "Organización / Escuela"}
                    </label>
                    <input 
                      placeholder="e.g. Ubisoft / University of Design"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none transition-colors"
                    />
                </div>
            </div>

            {/* SELECCIÓN DE FECHAS FLEXIBLE */}
            <div className="bg-zinc-900/30 p-4 rounded border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-red-500 text-xs font-mono uppercase mb-2">
                    <Calendar size={12}/> Timeframe Config
                </div>
                
                {/* FECHA INICIO */}
                <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 text-[10px] text-zinc-400 font-mono">START DATE (Year Required)</div>
                    <div className="col-span-5">
                        <select 
                            value={startMonth} 
                            onChange={(e) => setStartMonth(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white outline-none focus:border-red-500"
                        >
                            <option value="">(Month - Opt)</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="col-span-7">
                        <input 
                            type="number" 
                            placeholder="Year (e.g. 2022)" 
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                {/* FECHA FIN */}
                <div className="grid grid-cols-12 gap-2 items-end pt-2 border-t border-white/5">
                     <div className="col-span-12 flex justify-between items-center">
                        <span className="text-[10px] text-zinc-400 font-mono">END DATE</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isCurrent} 
                                onChange={(e) => setIsCurrent(e.target.checked)}
                                className="accent-red-500 w-3 h-3"
                            />
                            <span className="text-[10px] text-red-400 font-mono uppercase">Currently Working</span>
                        </label>
                     </div>
                     
                     {!isCurrent && (
                        <>
                            <div className="col-span-5">
                                <select 
                                    value={endMonth} 
                                    onChange={(e) => setEndMonth(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white outline-none focus:border-red-500"
                                >
                                    <option value="">(Month - Opt)</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="col-span-7">
                                <input 
                                    type="number" 
                                    placeholder="Year (e.g. 2024)" 
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </>
                     )}
                </div>
            </div>

            <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">Description</label>
                <textarea 
                  placeholder={modalLang === 'en' ? "Brief description of duties or achievements..." : "Breve descripción de funciones o logros..."}
                  value={modalLang === 'en' ? descEn : descEs}
                  onChange={(e) => modalLang === 'en' ? setDescEn(e.target.value) : setDescEs(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-white focus:border-red-500 outline-none min-h-[100px] resize-none transition-colors scrollbar-thin scrollbar-thumb-zinc-700"
                />
            </div>

            <button 
              onClick={handleSubmit}
              className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
            >
              <Check size={16} /> {itemToEdit ? 'UPDATE ENTRY' : 'ADD TO TIMELINE'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}