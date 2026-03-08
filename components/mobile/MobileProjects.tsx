'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Project, GalleryImage } from '@/types/database';
import Image from 'next/image';
import { Layers, ImageOff, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

// ==========================================
// COMPONENTE SECUNDARIO: VISTA DE DETALLE
// ==========================================
function MobileProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Al abrir el detalle, nos aseguramos de estar arriba del todo
    if (containerRef.current) containerRef.current.scrollIntoView();

    const fetchProjectDetails = async () => {
      // 1. Traer datos del proyecto
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      // 2. Traer la galería
      const { data: galleryData } = await supabase
        .from('project_gallery')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });

      if (projectData) setProject(projectData);
      if (galleryData) setGallery(galleryData);
      setLoading(false);
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500 gap-4">
        <Loader2 size={32} className="animate-spin text-red-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Loading Assets...</span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="flex flex-col w-full pb-10"
    >
      {/* HEADER FLUCTUANTE (Botón de volver) */}
      <div className="sticky top-0 z-50 px-4 py-4 bg-gradient-to-b from-[#030303] via-[#030303]/90 to-transparent backdrop-blur-md">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 transition-colors backdrop-blur-xl"
        >
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
        </button>
      </div>

      {/* PORTADA (Hero Image) */}
      <div className="w-full aspect-[4/3] relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl mt-2 px-4 box-border">
        <div className="w-full h-full relative rounded-2xl overflow-hidden bg-zinc-900">
          {project.thumbnail_url ? (
            <Image 
              src={project.thumbnail_url} 
              alt={project.title} 
              fill 
              className="object-cover"
              priority
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-zinc-900"><ImageOff size={32} className="text-zinc-600"/></div>
          )}
          {/* Sombra interior para darle profundidad */}
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none" />
        </div>
      </div>

      {/* INFORMACIÓN DEL PROYECTO */}
      <div className="px-6 mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-red-950/40 border border-red-500/20 rounded-md text-[9px] font-bold text-red-400 uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-black text-white uppercase leading-none tracking-tight">
          {project.title}
        </h1>
        {project.description && (
          <p className="text-sm text-zinc-400 leading-relaxed font-light mt-2 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            {project.description}
          </p>
        )}
      </div>

      {/* GALERÍA DE IMÁGENES NATIVA */}
      {gallery.length > 0 && (
        <div className="px-4 mt-12 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Sparkles size={14} className="text-red-500" />
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Gallery</h3>
          </div>
          
          {gallery.map((img, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              key={img.id} 
              className="w-full relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 shadow-xl"
            >
              {/* Usamos un aspect-ratio automático para que la imagen mantenga su proporción */}
              <Image 
                src={img.image_url} 
                alt={`${project.title} detail ${i + 1}`} 
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}


// ==========================================
// COMPONENTE PRINCIPAL: CUADRÍCULA
// ==========================================
export default function MobileProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // En lugar de pasar un string al Modal, usamos este estado para renderizar la vista de detalle
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

  return (
    <div className="pt-10 pb-10 w-full overflow-x-hidden">
      <AnimatePresence mode="wait">
        
        {/* SI HAY UN PROYECTO SELECCIONADO -> VISTA DE DETALLE */}
        {selectedProjectId ? (
          <MobileProjectDetail 
            key="detail" 
            projectId={selectedProjectId} 
            onBack={() => setSelectedProjectId(null)} 
          />
        ) : (
          
          /* SI NO HAY PROYECTO -> CUADRÍCULA DE PROYECTOS */
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="px-5"
          >
            <div className="flex items-center justify-between mb-8 px-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                Selected <span className="text-red-500">Works</span>
              </h2>
              <span className="text-[9px] font-bold tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                 {projects.length} PROJECTS
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-6">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-full aspect-[4/3] bg-zinc-900/50 rounded-3xl animate-pulse border border-white/5" />
                 ))}
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
                    onClick={() => setSelectedProjectId(project.id)}
                    className="group relative w-full aspect-[4/3] bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
                  >
                     {/* 1. IMAGEN */}
                     {project.thumbnail_url ? (
                       <Image 
                         src={project.thumbnail_url} 
                         alt={project.title} 
                         fill 
                         className="object-cover transition-transform duration-700 group-active:scale-105"
                         sizes="(max-width: 768px) 100vw, 50vw"
                       />
                     ) : (
                       <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                          <ImageOff size={24} className="text-zinc-700" />
                       </div>
                     )}

                     {/* 2. OVERLAY DE INFORMACIÓN (Estilo Premium) */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                        <div className="transition-transform duration-500">
                          {project.tags && project.tags.length > 0 && (
                            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-bold uppercase tracking-widest mb-3 rounded-full">
                               {project.tags[0]}
                            </span>
                          )}
                          <h3 className="text-2xl font-black text-white uppercase leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                              {project.title}
                          </h3>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}