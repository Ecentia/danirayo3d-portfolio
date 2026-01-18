'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';
import { 
  Plus, 
  Trash2, 
  Cpu, 
  BarChart3, 
  Layers,
  Terminal,
  Search,
  CheckCircle2
} from 'lucide-react';

interface TechItem {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

export default function TechManager() {
  const { notify, deleteItem, isAdmin } = useAdmin();
  const [techs, setTechs] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario
  const [name, setName] = useState('');
  const [category, setCategory] = useState('3D Modeling');
  const [proficiency, setProficiency] = useState(80);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTech = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('client_slug', CURRENT_SLUG)
      .order('category', { ascending: true });
    
    if (data) setTechs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTech();
  }, []);

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newTech = {
      name,
      category,
      proficiency,
      client_slug: CURRENT_SLUG
    };

    const { error } = await supabase.from('tech_stack').insert([newTech]);

    if (error) {
      notify("Error al añadir tecnología", "error");
    } else {
      notify(`${name} añadido al arsenal`, "success");
      setName('');
      setIsAdding(false);
      fetchTech();
    }
  };

  const handleDelete = async (id: string, techName: string) => {
    if (confirm(`¿Desinstalar ${techName} del sistema?`)) {
      await deleteItem('tech_stack', id);
      fetchTech();
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER DEL MANAGER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Cpu className="text-red-600" size={24} /> Gestión de Arsenal
          </h2>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-2">Configuración de habilidades y software</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          {isAdding ? <Terminal size={14} /> : <Plus size={14} />}
          {isAdding ? 'Cerrar Terminal' : 'Nueva Tecnología'}
        </button>
      </div>

      {/* FORMULARIO DE ADICIÓN (TERMINAL STYLE) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddTech} className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-4 space-y-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tech_Name</label>
                <input 
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Unreal Engine 5"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-red-600 transition-all"
                />
              </div>

              <div className="md:col-span-3 space-y-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-red-600 transition-all appearance-none"
                >
                  <option value="3D Modeling">3D Modeling</option>
                  <option value="Game Engines">Game Engines</option>
                  <option value="Texturing/PBR">Texturing/PBR</option>
                  <option value="Post-Production">Post-Production</option>
                  <option value="Illustration">Illustration</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-3">
                <div className="flex justify-between">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Proficiency</label>
                  <span className="text-[9px] font-mono text-red-500">{proficiency}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={proficiency} onChange={(e) => setProficiency(parseInt(e.target.value))}
                  className="w-full h-10 accent-red-600 bg-transparent cursor-pointer"
                />
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Registrar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTADO DE TECNOLOGÍAS */}
      <div className="bg-zinc-900/10 border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-900/30">
              <th className="px-8 py-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tecnología</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Categoría</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Dominio</th>
              <th className="px-8 py-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {techs.map((tech) => (
              <tr key={tech.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                    <span className="text-sm font-bold text-white tracking-tight">{tech.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase border border-white/10 px-2 py-1 rounded-md">
                    {tech.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4 w-40">
                    <div className="flex-1 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600" style={{ width: `${tech.proficiency}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">{tech.proficiency}%</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => handleDelete(tech.id, tech.name)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {techs.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <Layers size={40} className="mx-auto text-zinc-800 mb-4" />
                  <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">No hay módulos instalados en el arsenal</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}