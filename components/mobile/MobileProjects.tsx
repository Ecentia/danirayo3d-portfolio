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
  // ↓ null = cerrado; string = id del proyecto seleccionado
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  const handleOpen = (id: string) => setSelectedProjectId(id);
  const handleClose = () => setSelectedProjectId(null);

  return (
    <div className="p-4 pt-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-black text-white uppercase flex items-center gap-3">
          <Layers className="text-red-600" /> Galería
        </h2>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-white/10 px-2 py-1 rounded">
          {projects.length} PROYECTOS
        </span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full aspect-video bg-zinc-900 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleOpen(project.id)}
              className="group relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
            >
              {project.thumbnail_url ? (
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100vw"
                />
              ) : (
                <div className="w-full h-full bg-[#111] flex items-center justify-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                  />
                  <div className="w-20 h-20 bg-red-600/20 blur-3xl rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <div className="flex flex-col items-center gap-2 text-zinc-600 relative z-10">
                    <ImageOff size={24} />
                    <span className="text-[10px] uppercase tracking-widest">Sin Vista Previa</span>
                  </div>
                </div>
              )}

              {/* Overlay con info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-5 flex flex-col justify-end">
                <span className="inline-block px-2 py-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider mb-2 rounded-sm w-fit">
                  {project.tags && project.tags.length > 0 ? project.tags[0] : 'Portfolio'}
                </span>
                <h3 className="text-xl font-black text-white uppercase leading-none drop-shadow-lg">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal – se monta solo cuando hay un proyecto seleccionado */}
      <ProjectModal
        isOpen={selectedProjectId !== null}
        onClose={handleClose}
        initialProjectId={selectedProjectId}
        allProjectsList={projects}
      />
    </div>
  );
}