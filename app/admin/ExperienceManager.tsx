'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Briefcase, GraduationCap, 
  Calendar, Building2, AlignLeft, Check, X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// === CONFIGURACIÓN ===
const CLIENT_SLUG = 'daniel-rayo'; 

interface ExperienceItem {
  id: string;
  type: 'work' | 'education';
  title: string;
  organization: string;
  start_date: string;
  end_date: string | null;
  description: string;
  display_order: number;
}

export default function ExperienceManager() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    type: 'work' as 'work' | 'education',
    title: '',
    organization: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    fetchExperience();
  }, []);

  async function fetchExperience() {
    setLoading(true);
    const { data } = await supabase
      .from('experience')
      .select('*')
      .eq('client_slug', CLIENT_SLUG)
      .order('display_order', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  }

  const handleSave = async () => {
    if (!formData.title || !formData.organization) return;

    const newItem = {
      ...formData,
      client_slug: CLIENT_SLUG,
      display_order: items.length
    };

    const { error } = await supabase.from('experience').insert(newItem);
    
    if (!error) {
      setIsAdding(false);
      setFormData({
        type: 'work',
        title: '',
        organization: '',
        start_date: '',
        end_date: '',
        description: ''
      });
      fetchExperience();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este hito de la trayectoria?')) return;
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) fetchExperience();
  };

  return (
    <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
        <div>
          <h2 className="text-white font-black text-lg tracking-tighter uppercase italic">Timeline Manager</h2>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Client_ID: {CLIENT_SLUG}</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 p-6 bg-zinc-900/40 border border-red-600/20 rounded-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                   <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Tipo de Entrada</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFormData({...formData, type: 'work'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${formData.type === 'work' ? 'bg-red-600 border-red-500 text-white' : 'bg-black border-white/5 text-zinc-500'}`}
                      >
                        <Briefcase size={14} /> Laboral
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, type: 'education'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${formData.type === 'education' ? 'bg-red-600 border-red-500 text-white' : 'bg-black border-white/5 text-zinc-500'}`}
                      >
                        <GraduationCap size={14} /> Académico
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Cargo / Título</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ej: Senior 3D Artist"
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Empresa / Centro</label>
                    <input 
                      type="text" 
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      placeholder="Ej: Ecentia Studios"
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Inicio</label>
                      <input 
                        type="text" 
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        placeholder="Ene 2022"
                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Fin (o "Presente")</label>
                      <input 
                        type="text" 
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        placeholder="Presente"
                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Descripción / Logros</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      placeholder="Describe tus responsabilidades..."
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-red-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-white text-black font-black uppercase py-3 rounded-lg text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} /> Registrar en Trayectoria
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="py-20 text-center font-mono text-zinc-700 animate-pulse uppercase tracking-[0.5em]">Loading_History...</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-zinc-900/10 border border-white/5 hover:border-red-600/30 rounded-xl transition-all"
              >
                <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border transition-colors ${item.type === 'work' ? 'bg-zinc-900 border-white/5 text-red-500' : 'bg-zinc-900 border-white/5 text-blue-500'}`}>
                  {item.type === 'work' ? <Briefcase size={20} /> : <GraduationCap size={20} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white text-sm font-black uppercase tracking-tight">{item.title}</h4>
                    <span className="text-[9px] font-mono bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase">{item.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-mono uppercase">
                      <Building2 size={12} /> {item.organization}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono uppercase">
                      <Clock size={12} /> {item.start_date} — {item.end_date || 'Presente'}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-500 transition-all self-end md:self-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {items.length === 0 && !isAdding && (
              <div className="py-12 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-[0.2em] border border-dashed border-white/5 rounded-xl">
                No hay registros detectados en el sistema
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}