'use client';

import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import ProjectCard from '../projects/ProjectCard';
import ProjectModal from '../projects/ProjectModal';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  768: 2,
  500: 1
};

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin, deleteProject } = useAdmin();

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setProjects(data);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleOpenCreate = () => {
    setSelectedProjectId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setSelectedProjectId(id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    await deleteProject(projectId);
    fetchProjects();
  };

  return (
    <section className="py-24 bg-black relative z-10 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* CABECERA DE SECCIÓN TÉCNICA */}
        <div className="flex flex-col mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[1px] bg-red-600"></div>
            <span className="text-red-500 font-bold text-[10px] tracking-[0.5em] uppercase flex items-center gap-2">
               <LayoutGrid size={12} /> Galería_Proyectos
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
            Selección <span className="text-zinc-800">Visual</span>
          </h2>
        </div>

        <Masonry 
          breakpointCols={breakpointColumnsObj} 
          className="flex w-auto -ml-6" 
          columnClassName="pl-6 bg-clip-padding"
        >
          {/* BOTÓN AÑADIR (ADMIN) - ESTILO HEADER */}
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button 
                onClick={handleOpenCreate}
                className="w-full aspect-square border border-white/5 bg-zinc-900/20 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-red-600/50 hover:bg-zinc-900/40 transition-all group relative overflow-hidden"
              >
                {/* Micro-esquinas tácticas */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500">
                  <Plus size={24} />
                </div>
                <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-500 group-hover:text-white uppercase transition-colors">
                  Nueva_Entidad
                </span>
              </button>
            </motion.div>
          )}

          {/* LISTA DE PROYECTOS */}
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.div 
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative group mb-6"
              >
                {/* Botón Borrar Minimalista */}
                {isAdmin && (
                    <button 
                        onClick={(e) => handleDeleteClick(e, project.id)}
                        className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md text-white/50 p-2 border border-white/10 rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:border-red-500"
                        title="Eliminar Proyecto"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
                
                <div className="transform transition-transform duration-700 group-hover:translate-y-[-4px]">
                  <ProjectCard 
                    project={project} 
                    onClick={() => handleOpenEdit(project.id)}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Masonry>

        {/* MODAL DE EDICIÓN */}
        <ProjectModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialProjectId={selectedProjectId}
          allProjectsList={projects}
        />
      </div>
    </section>
  );
}