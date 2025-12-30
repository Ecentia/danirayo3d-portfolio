'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import Image from 'next/image';
import { Layers, ImageOff } from 'lucide-react';
import ProjectModal from '@/components/projects/ProjectModal';

export default function MobileProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-4 pt-8 pb-32">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-black text-white uppercase flex items-center gap-3">
          <Layers className="text-red-600" /> Galería
        </h2>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-white/10 px-2 py-1 rounded">
           {projects.length} PROYECTOS
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
           {[1,2,3].map(i => (
              <div key={i} className="w-full aspect-video bg-zinc-900 rounded-xl animate-pulse border border-white/5" />
           ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedProject(project.id)}
              className="group relative w-full aspect-[4/3] md:aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer"
            >
               {/* 1. IMAGEN (Usando thumbnail_url REAL) */}
               {project.thumbnail_url ? (
                 <Image 
                   src={project.thumbnail_url} 
                   alt={project.title} 
                   fill 
                   className="object-cover transition-transform duration-700 group-hover:scale-110"
                   sizes="(max-width: 768px) 100vw, 50vw"
                 />
               ) : (
                 // Fallback si no hay thumbnail_url
                 <div className="w-full h-full bg-[#111] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                    <div className="w-20 h-20 bg-red-600/20 blur-3xl rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                       <ImageOff size={24} />
                       <span className="text-[10px] uppercase tracking-widest">Sin Vista Previa</span>
                    </div>
                 </div>
               )}

               {/* 2. OVERLAY DE INFORMACIÓN */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                  <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2 py-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider mb-2 rounded-sm">
                        {/* Usamos el primer TAG como categoría, o 'Portfolio' si no hay */}
                        {project.tags && project.tags.length > 0 ? project.tags[0] : 'Portfolio'}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase leading-none drop-shadow-lg">
                        {project.title}
                    </h3>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Usamos el Modal existente para ver detalles */}
      <ProjectModal 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
        initialProjectId={selectedProject} 
        allProjectsList={projects} 
      />
    </div>
  );
}