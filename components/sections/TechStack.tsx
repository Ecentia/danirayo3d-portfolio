'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  // 🧊 3D, Render & Escultura
  SiBlender, SiAutodeskmaya, SiHoudini, SiAutodesk, SiSketchfab,
  
  // 🎮 Motores de Juego (Game Engines)
  SiUnity, SiUnrealengine, SiGodotengine, SiCryengine,
  
  // 🎬 Edición de Vídeo, VFX y Postproducción
  SiAdobeaftereffects, SiAdobepremierepro, SiDavinciresolve, SiKdenlive, SiObsstudio, SiNuke,
  
  // 🎨 Arte 2D, Texturas y Concept Art
  SiAdobephotoshop, SiAdobeillustrator, SiAdobelightroom, SiKrita, SiAseprite, SiFigma, SiGimp, SiInkscape, 
  
  // 🕹️ Hardware, Plataformas y Estudios
  SiNvidia, SiAmd, SiSteam, SiEpicgames, SiWacom,
  
  // 📁 Gestión, Repositorios y Portfolio
  SiArtstation, SiBehance, SiNotion, SiTrello, SiJira, SiGithub, SiDiscord
} from 'react-icons/si';



import { Monitor, Video, Plus, Trash2, X, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';
import { TechItem } from '@/types/database';

// --- ICONOS CUSTOM (SUBSTANCE, MARVELOUS Y ZBRUSH) ---
const SubstanceDesignerIcon = (props: any) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="1.8em" height="1.8em" {...props}><path fillRule="evenodd" d="M90.75,6.17h331a90.75,90.75,0,0,1,90.75,90.75V415.08a90.75,90.75,0,0,1-90.75,90.75h-331A90.75,90.75,0,0,1,0,415.08V96.92A90.75,90.75,0,0,1,90.75,6.17ZM94.15,349.71V131.06a2.5,2.5,0,0,1,2.25-2.74h.16c3.43-.23,8.48-.4,15.12-.52s14.44-.22,23.38-.34,18.45-.17,28.53-.17q41.26,0,68.42,14.09a95.24,95.24,0,0,1,40.74,38.68q13.58,24.58,13.57,56.55a126,126,0,0,1-7,43.83A102.3,102.3,0,0,1,260,313.26a114.64,114.64,0,0,1-27.68,22.87,121.52,121.52,0,0,1-33,13.4,145.18,145.18,0,0,1-34.72,4.3H139q-13.57,0-25.26-.17t-17.54-.52C94.84,353.14,94.15,352,94.15,349.71Zm47.44-180.15V311.89q3.78,0,6.88.17l6.36.34c2.17.12,4.64.18,7.39.18a92.25,92.25,0,0,0,30.6-4.82,62.51,62.51,0,0,0,23.54-14.43,64.82,64.82,0,0,0,15.13-23.73,90,90,0,0,0,5.33-32,80.65,80.65,0,0,0-5.16-30.08,56.9,56.9,0,0,0-14.95-21.66A61.33,61.33,0,0,0,193.33,173a102.07,102.07,0,0,0-29.74-4.12c-4.58,0-8.42.05-11.51.17s-6.59.29-10.49.51Zm279.84,57.44A80.53,80.53,0,0,0,401,219.76,108.56,108.56,0,0,0,377.08,217a44.93,44.93,0,0,0-12.9,1.55,11.62,11.62,0,0,0-6.7,4.3,10.8,10.8,0,0,0-1.72,5.84,9.19,9.19,0,0,0,2.06,5.5,23.59,23.59,0,0,0,7.22,5.68,144.12,144.12,0,0,0,15.13,7A150.13,150.13,0,0,1,413,262.56a49.88,49.88,0,0,1,16.85,17.7,47.26,47.26,0,0,1,5,22,49.39,49.39,0,0,1-8.25,28.37,54.32,54.32,0,0,1-23.89,19.08Q387,356.58,364,356.58A139.59,139.59,0,0,1,335,353.83a83,83,0,0,1-20.8-6.87,4.46,4.46,0,0,1-2.4-4.13V305.7a2,2,0,0,1,.86-1.89,1.68,1.68,0,0,1,1.89.17A85.46,85.46,0,0,0,340,314.47,108.91,108.91,0,0,0,365,317.73q12,0,17.71-3.09a9.72,9.72,0,0,0,5.67-8.94q0-4.45-5.15-8.59t-21-10a126.39,126.39,0,0,1-30.42-15.47,52.63,52.63,0,0,1-16.16-18.05,47.37,47.37,0,0,1-5-21.83A49.3,49.3,0,0,1,318,206a52.41,52.41,0,0,1,22.34-19.59q15.12-7.56,37.82-7.56a166.33,166.33,0,0,1,26.47,1.89,64.64,64.64,0,0,1,17.88,5,3.13,3.13,0,0,1,2.06,1.89,9.38,9.38,0,0,1,.34,2.58v34.72a2.32,2.32,0,0,1-1,2.07A2.26,2.26,0,0,1,421.43,227Z"/></svg>
);
const MarvelousDesignerIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1.8em" height="1.8em" {...props}><path d="M3 4v16h3V9l6 7 6-7v11h3V4h-3l-6 7-6-7H3z"/></svg>
);
const SubstancePainterIcon = (props: any) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="1.8em" height="1.8em" {...props}><path fillRule="evenodd" d="M90.75,0h331a90.75,90.75,0,0,1,90.75,90.75V408.91a90.75,90.75,0,0,1-90.75,90.75h-331A90.75,90.75,0,0,1,0,408.91V90.75A90.75,90.75,0,0,1,90.75,0ZM110.85,350.39V130.71c0-1.6.68-2.4,2.06-2.4q5.49,0,13.06-.17t16.33-.35l18.57-.34q9.8-.18,19.42-.18,26.13,0,44,6.54A76.18,76.18,0,0,1,253,151.34a67.28,67.28,0,0,1,15.64,24.24,80.35,80.35,0,0,1,4.82,27.67q0,27.51-12.72,45.38a72,72,0,0,1-34.38,26,137.05,137.05,0,0,1-48.13,8.08q-7.57,0-10.66-.18c-2.06-.11-5.16-.17-9.28-.17v67.73a2.74,2.74,0,0,1-2.32,3.09,2.49,2.49,0,0,1-.77,0H113.25C111.65,353.14,110.85,352.23,110.85,350.39Zm47.44-180.83v71.17q4.46.35,8.25.34h11.34a81.19,81.19,0,0,0,24.58-3.44A37.11,37.11,0,0,0,220,226.29q6.7-7.9,6.7-22a34.81,34.81,0,0,0-5-18.9,32.14,32.14,0,0,0-15-12.21,63.8,63.8,0,0,0-25.09-4.29q-8.25,0-14.61.17t-8.77.51ZM401,319.11V347.3q0,3.78-2.75,4.47a122.82,122.82,0,0,1-13.75,3.44A88.75,88.75,0,0,1,368,356.58q-22.35,0-35.06-11.69t-12.72-37.47V222.16H299.92c-1.83,0-2.75-1-2.75-3.09V185c0-1.83,1-2.75,3.1-2.75h20.28q.34-5.84.86-13.58c.35-5.15.8-10.31,1.38-15.47s1.08-9.34,1.54-12.54a6.09,6.09,0,0,1,1-1.89,3.74,3.74,0,0,1,1.72-1.21L368,132.44a2.87,2.87,0,0,1,1.89.09c.46.23.52.83.52,2q-.69,7.91-1,21.49t-.69,26.29h32c1.38,0,2.07.92,2.07,2.75v34.73a2.12,2.12,0,0,1-1.72,2.4H368.34v73.57q0,11.7,4,16.68t14.61,5c2.06,0,4-.05,5.85-.17s3.66-.29,5.5-.52a2.21,2.21,0,0,1,1.89.17A2.44,2.44,0,0,1,401,319.11Z"/></svg>
);
const ZbrushIcon = (props: any) => (
  <svg viewBox="1050 1730 450 350" fill="currentColor" width="1.8em" height="1.8em" {...props}>
    <path d="M1175 1977 c-72 -71 -70 -144 5 -195 32 -22 43 -24 116 -19 44 2 91 10 102 16 56 30 -5 183 -90 227 -50 26 -86 18 -133 -29z" />
  </svg>
);

// --- MAPA MAESTRO DE ICONOS ---
export const ICON_MAP: Record<string, React.FC<any>> = {
  // Custom
  SubstanceDesignerIcon, SubstancePainterIcon, MarvelousDesignerIcon, ZbrushIcon,
  
  // 3D & Motores
  SiBlender, SiAutodeskmaya, SiHoudini, SiAutodesk, SiSketchfab,
  SiUnity, SiUnrealengine, SiGodotengine, SiCryengine,
  
  // Video & VFX
  SiAdobeaftereffects, SiAdobepremierepro, SiDavinciresolve, SiKdenlive, SiObsstudio, SiNuke,
  
  // 2D & Concept Art
  SiAdobephotoshop, SiAdobeillustrator, SiAdobelightroom, SiKrita, SiAseprite, SiFigma, SiGimp, SiInkscape,
  
  // Hardware & Industria
  SiNvidia, SiAmd, SiSteam, SiEpicgames, SiWacom,
  
  // Portfolios & Gestión
  SiArtstation, SiBehance, SiNotion, SiTrello, SiJira, SiGithub, SiDiscord
};



const CATEGORIES = [
  { id: "3D & TEXTURING", icon: <Monitor size={18} /> },
  { id: "POST & CREATIVE", icon: <Video size={18} /> }
];

export default function TechStack() {
  const [techList, setTechList] = useState<TechItem[]>([]);
  const { isAdmin, deleteItem, notify } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '3D & TEXTURING', icon_key: 'SiBlender' });

  // Cargar datos
  const fetchTech = async () => {
    const { data } = await supabase
      .from('tech_stack')
      .select('*')
      .eq('client_slug', CURRENT_SLUG)
      .order('display_order', { ascending: true });
    if (data) setTechList(data);
  };

  useEffect(() => { fetchTech(); }, []);

  // Botón mágico para migrar por primera vez los datos a la DB
  const handleSeedDB = async () => {
    const initialData = [
      { client_slug: CURRENT_SLUG, name: 'Blender', category: '3D & TEXTURING', icon_key: 'SiBlender', display_order: 1 },
      { client_slug: CURRENT_SLUG, name: 'Autodesk Maya', category: '3D & TEXTURING', icon_key: 'SiAutodeskmaya', display_order: 2 },
      { client_slug: CURRENT_SLUG, name: 'Unity Engine', category: '3D & TEXTURING', icon_key: 'SiUnity', display_order: 3 },
      { client_slug: CURRENT_SLUG, name: 'Substance Painter', category: '3D & TEXTURING', icon_key: 'SubstancePainterIcon', display_order: 4 },
      { client_slug: CURRENT_SLUG, name: 'Substance Designer', category: '3D & TEXTURING', icon_key: 'SubstanceDesignerIcon', display_order: 5 },
      { client_slug: CURRENT_SLUG, name: 'Marvelous Designer', category: '3D & TEXTURING', icon_key: 'MarvelousDesignerIcon', display_order: 6 },
      { client_slug: CURRENT_SLUG, name: 'After Effects', category: 'POST & CREATIVE', icon_key: 'SiAdobeaftereffects', display_order: 7 },
      { client_slug: CURRENT_SLUG, name: 'Premiere Pro', category: 'POST & CREATIVE', icon_key: 'SiAdobepremierepro', display_order: 8 },
      { client_slug: CURRENT_SLUG, name: 'Photoshop', category: 'POST & CREATIVE', icon_key: 'SiAdobephotoshop', display_order: 9 },
      { client_slug: CURRENT_SLUG, name: 'Aseprite', category: 'POST & CREATIVE', icon_key: 'SiAseprite', display_order: 10 },
      { client_slug: CURRENT_SLUG, name: 'Krita', category: 'POST & CREATIVE', icon_key: 'SiKrita', display_order: 11 },
      { client_slug: CURRENT_SLUG, name: 'Kdenlive', category: 'POST & CREATIVE', icon_key: 'SiKdenlive', display_order: 12 },
    ];
    await supabase.from('tech_stack').insert(initialData);
    notify("¡Programas iniciales migrados a la Base de Datos!", "success");
    fetchTech();
  };

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const { error } = await supabase.from('tech_stack').insert([{
      ...formData,
      client_slug: CURRENT_SLUG,
      display_order: techList.length
    }]);
    
    if (error) {
        notify("Error al añadir: " + error.message, "error");
    } else {
        notify("Software añadido", "success");
        setIsModalOpen(false);
        setFormData({ name: '', category: '3D & TEXTURING', icon_key: 'SiBlender' });
        fetchTech();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteItem('tech_stack', id);
    fetchTech();
  };

 return (
    <section className="relative w-full py-32 lg:py-48 bg-[#030305] overflow-hidden" id="tech-stack">
      
      {/* --- NUEVO FONDO ESPECTACULAR: MATRIZ DE PUNTOS Y NÚCLEO VOLUMÉTRICO --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Patrón de matriz de puntos (Dot Matrix) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Núcleo central que respira */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-900/20 blur-[150px] rounded-full mix-blend-screen"
        />
        
        {/* Viñeta para oscurecer los bordes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030305_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        
        {/* --- CABECERA DE SECCIÓN --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 pb-8 border-b border-white/[0.05]">
          <div className="space-y-4">
             <motion.div 
               initial={{opacity: 0, x: -20}} whileInView={{opacity: 1, x: 0}} viewport={{once:true}} transition={{duration: 0.8}}
               className="flex items-center gap-3 text-red-500 font-mono text-xs md:text-sm tracking-[0.4em] uppercase"
             >
                <Monitor size={16} className="animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800 font-bold">SOFTWARE_MODULES</span>
             </motion.div>
             <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl">
                Tech <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 to-zinc-800">Arsenal</span>
             </h2>
          </div>

          {/* Acciones de Admin */}
          {isAdmin && (
            <div className="flex flex-wrap gap-4 mt-6 md:mt-0">
              {techList.length === 0 && (
                 <button onClick={handleSeedDB} className="flex items-center gap-2 bg-zinc-900 text-zinc-400 border border-zinc-700 px-5 py-3 rounded-full text-xs font-mono hover:bg-zinc-800 hover:text-white transition-all shadow-lg hover:border-zinc-500">
                    <Database size={14} /> CARGAR DEFAULT_SYS
                 </button>
              )}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)} 
                className="group flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-full text-xs font-bold tracking-tight hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
              >
                 <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> 
                 <span>ADD SOFTWARE NODE</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* --- GRID DE PROGRAMAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative z-20">
          {CATEGORIES.map((cat, idx) => {
            const catItems = techList.filter(t => t.category === cat.id);
            if (catItems.length === 0 && !isAdmin) return null;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Título de Categoría Limpio y Elegante */}
                <div className="flex items-center gap-4 border-b border-white/[0.05] pb-4">
                  <div className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-black text-white tracking-[0.2em] uppercase">
                    {cat.id}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {catItems.map((item) => {
                      const IconComponent = ICON_MAP[item.icon_key] || Monitor;
                      return (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                          className="group relative bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.05] p-5 rounded-2xl transition-all duration-500 overflow-hidden flex items-center gap-5 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_15px_40px_-10px_rgba(220,38,38,0.4)] hover:border-red-500/40 hover:bg-[#0f0f13]"
                        >
                          {/* Reflejo de luz diagonal al hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                          {/* Línea de circuito inferior */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent group-hover:w-full transition-all duration-700 ease-out" />

                          {isAdmin && (
                            <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-black/80 backdrop-blur border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-900 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110">
                                <Trash2 size={14}/>
                            </button>
                          )}

                          {/* Caja del Icono Flotante */}
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-zinc-800/50 to-black/50 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-red-500/50 transition-all duration-500 relative z-10 group-hover:bg-red-950/20">
                            <IconComponent size={28} className="text-zinc-400 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-500 group-hover:scale-110" />
                          </div>
                          
                          {/* Texto del Programa */}
                          <div className="flex flex-col relative z-10 flex-1 min-w-0">
                            <span className="text-base font-extrabold text-zinc-300 group-hover:text-white truncate transition-colors tracking-tight">
                              {item.name}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL AÑADIR SOFTWARE (Solo Admin) --- */}
      <AnimatePresence>
        {isAdmin && isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#050507] border border-red-900/40 p-8 rounded-3xl max-w-md w-full relative shadow-[0_0_60px_rgba(220,38,38,0.15)]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full hover:bg-red-900/50">
                 <X size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 border border-red-500/20">
                    <Database size={18} />
                 </div>
                 <h3 className="text-white font-black tracking-tighter text-2xl uppercase">Insert Node</h3>
              </div>
              
              <form onSubmit={handleAddTech} className="flex flex-col gap-6">
                 <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">Node_Name</label>
                    <input autoFocus required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono focus:ring-1 focus:ring-red-500/50" placeholder="e.g. Marvelous Designer" />
                 </div>
                 <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">Partition_Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono appearance-none focus:ring-1 focus:ring-red-500/50">
                       <option value="3D & TEXTURING">3D & TEXTURING</option>
                       <option value="POST & CREATIVE">POST & CREATIVE</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-mono mb-2 block tracking-widest">Icon_Key_Hash</label>
                    <select value={formData.icon_key} onChange={(e) => setFormData({...formData, icon_key: e.target.value})} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono appearance-none focus:ring-1 focus:ring-red-500/50">
                       {Object.keys(ICON_MAP).map(key => (
                         <option key={key} value={key}>{key.replace('Si', '').replace('Icon', '')}</option>
                       ))}
                    </select>
                 </div>
                 
                 <button type="submit" className="mt-2 bg-gradient-to-r from-red-700 to-red-600 text-white font-bold tracking-widest py-4 rounded-xl hover:from-red-600 hover:to-red-500 transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)] uppercase">
                    Initialize Node
                 </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}