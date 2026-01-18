'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';
import { Plus, LayoutGrid, Terminal } from 'lucide-react';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectModal from '@/components/projects/ProjectModal';

// === CONFIGURACIÓN MULTI-PORTFOLIO ===
const CLIENT_SLUG = 'daniel-rayo'; 

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isAdmin } = useAdmin();

  const fetchProjects = async () => {
    setLoading(true);
    // Filtrado por client_slug para soportar múltiples portfolios
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('client_slug', CLIENT_SLUG)
      .order('display_order', { ascending: true });
    
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenModal = (id: string | null) => {
    setSelectedProjectId(id);
    setIsModalOpen(true);
  };

  return (
    <section className="relative w-full py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER DE PROYECTOS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-red-600 animate-pulse" />
              <span className="text-red-600 font-mono text-xs tracking-[0.4em] uppercase">
                // ARCHIVE_DATABASE
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
              PROYECTOS <span className="text-zinc-800">DESTACADOS</span>
            </h2>
          </div>

          {isAdmin && (
            <button 
              onClick={() => handleOpenModal(null)}
              className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              Nuevo Proyecto
            </button>
          )}
        </div>

        {/* REJILLA DE PROYECTOS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/10] bg-zinc-900/20 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <ProjectCard 
                    project={project} 
                    onClick={() => handleOpenModal(project.id)} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && projects.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-zinc-900/5">
            <LayoutGrid size={40} className="text-zinc-800 mb-4" />
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]">
              [ERROR]: No se han encontrado registros en el sector {CLIENT_SLUG}
            </p>
          </div>
        )}
      </div>

      {/* MODAL DEL PROYECTO */}
      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProjectId(null);
          fetchProjects(); // Recargar por si hubo cambios en admin
        }}
        initialProjectId={selectedProjectId}
        allProjectsList={projects}
      />

      {/* DECORACIÓN FONDO */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </section>
  );
}