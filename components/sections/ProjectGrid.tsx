'use client';
import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import ProjectCard from '../projects/ProjectCard';
import ProjectModal from '../projects/ProjectModal';
import { Cpu, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

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
  const { isAdmin, deleteProject } = useAdmin(); // Usamos deleteProject del contexto

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
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

  // Función wrapper para manejar el borrado sin abrir el modal
  const handleDeleteClick = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Evita que se abra el modal al hacer click en la papelera
    await deleteProject(projectId);
    fetchProjects(); // Recargar la lista tras borrar
  };

  return (
    <section className="py-20 bg-black relative z-10">
       <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2 opacity-50 font-mono text-xs text-red-500 tracking-[0.3em]">
                 <Cpu size={14} /><span>SYSTEM_MODULE: PROJECT_DATABASE</span>
            </div>
            <div className="h-[1px] flex-grow mx-8 bg-gradient-to-r from-red-900/50 to-transparent"></div>
        </div>

        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
          
          {/* BOTÓN AÑADIR (ADMIN) */}
          {isAdmin && (
            <div className="mb-4">
              <button 
                onClick={handleOpenCreate}
                className="w-full aspect-video border-2 border-dashed border-red-900/30 bg-red-950/5 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-red-500/50 hover:bg-red-500/10 transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 rounded-full bg-red-500/10 text-red-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all">
                  <Plus size={32} />
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-red-500/60 uppercase">Add_New_Entity</span>
              </button>
            </div>
          )}

          {/* LISTA DE PROYECTOS */}
          {projects.map((project) => (
            <div key={project.id} className="relative group mb-4">
                {/* Botón Borrar Flotante (Solo aparece en hover si eres admin) */}
                {isAdmin && (
                    <button 
                        onClick={(e) => handleDeleteClick(e, project.id)}
                        className="absolute -top-2 -right-2 z-50 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-500"
                        title="Eliminar Proyecto"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                
                {/* La tarjeta normal */}
                <ProjectCard 
                  project={project} 
                  onClick={() => handleOpenEdit(project.id)}
                />
            </div>
          ))}
        </Masonry>

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