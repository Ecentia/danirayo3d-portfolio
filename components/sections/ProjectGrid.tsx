'use client';
import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import ProjectCard from '../projects/ProjectCard';
import ProjectModal from '../projects/ProjectModal';
import { Cpu } from 'lucide-react';

// Configuración de columnas para el Masonry layout
const breakpointColumnsObj = {
  default: 4, // Pantallas grandes: 4 columnas
  1100: 3,    // Laptops: 3 columnas
  768: 2,     // Tablets: 2 columnas
  500: 1      // Móviles: 1 columna
};

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <section className="py-20 bg-black relative z-10">
       <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Cabecera decorativa */}
        <div className="flex items-center gap-2 mb-12 opacity-50 font-mono text-xs text-red-500 tracking-[0.3em]">
             <Cpu size={14} /><span>SYSTEM_MODULE: PROJECT_DATABASE</span>
             <div className="h-[1px] flex-grow bg-gradient-to-r from-red-900 to-transparent"></div>
        </div>

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4" // Margen negativo para compensar el padding de las columnas
          columnClassName="pl-4 bg-clip-padding" // Padding izquierdo para las columnas
        >
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => setSelectedProjectId(project.id)}
            />
          ))}
        </Masonry>

        {/* Si no hay proyectos y eres admin, mostrar mensaje */}
        {projects.length === 0 && (
           <div className="text-center text-gray-500 py-20 font-mono border-2 border-dashed border-gray-800 rounded">
              NO DATA FOUND. [ADMIN]: Add projects via Supabase Dashboard.
           </div>
        )}

        <ProjectModal 
          isOpen={!!selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          initialProjectId={selectedProjectId}
          allProjectsList={projects} // Pasamos la lista completa para la navegación
        />
      </div>
    </section>
  );
}