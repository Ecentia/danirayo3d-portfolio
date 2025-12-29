'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { FullProjectData, Project } from '@/types/database';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId: string | null;
  allProjectsList: Project[]; // Para la navegación
}

export default function ProjectModal({ isOpen, onClose, initialProjectId, allProjectsList }: ProjectModalProps) {
  const [currentProject, setCurrentProject] = useState<FullProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAdmin, registerChange } = useAdmin();

  // Encontrar el índice actual para la navegación
  const currentIndex = allProjectsList.findIndex(p => p.id === currentProject?.id);
  const prevProject = currentIndex > 0 ? allProjectsList[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjectsList.length - 1 ? allProjectsList[currentIndex + 1] : null;

  // Cargar datos del proyecto completo (incluida la galería)
  const loadProject = async (projectId: string) => {
    setLoading(true);
    // 1. Cargar datos base del proyecto
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // 2. Cargar imágenes de galería relacionadas
    const { data: galleryData } = await supabase
      .from('project_gallery')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (projectData) {
      setCurrentProject({
        ...projectData,
        gallery: galleryData || []
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && initialProjectId) {
      loadProject(initialProjectId);
      document.body.style.overflow = 'hidden'; // Bloquear scroll del body
    } else {
      document.body.style.overflow = 'unset';
      setCurrentProject(null);
    }
  }, [isOpen, initialProjectId]);

  const handleNavigate = (projectId: string) => {
    loadProject(projectId);
  };

  // Manejo de edición Admin (Textos)
  const handleEdit = (field: keyof Project, value: string | string[]) => {
    if (!currentProject || !isAdmin) return;
    setCurrentProject(prev => prev ? ({ ...prev, [field]: value }) : null);
    // Usamos el ID del proyecto como identificador para el contexto de admin
    registerChange(`project_${currentProject.id}`, { [field]: value });
  };

  if (!isOpen || !currentProject) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm overflow-y-auto flex justify-center"
        onClick={onClose} // Cerrar al hacer click fuera
      >
        
        {/* Botón Cerrar */}
        <button onClick={onClose} className="fixed top-6 right-6 text-white/50 hover:text-white z-[110]">
          <X size={32} />
        </button>

        {/* Navegación Lateral (Estilo ArtStation) */}
        {prevProject && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleNavigate(prevProject.id); }}
            className="fixed left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 z-[110] hidden md:block"
          >
            <ChevronLeft size={48} />
          </button>
        )}
        {nextProject && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleNavigate(nextProject.id); }}
            className="fixed right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 z-[110] hidden md:block"
          >
            <ChevronRight size={48} />
          </button>
        )}

        {/* Contenido Principal (Scroll Vertical) */}
        <div 
          className="w-full max-w-5xl bg-[#1a1a1a] min-h-screen py-12 px-4 md:px-8 cursor-default shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Evitar cierre al hacer click dentro
        >
          {loading ? (
            <div className="flex justify-center items-center h-96 text-white">Cargando proyecto...</div>
          ) : (
            <div className="flex flex-col gap-8">
               {/* HEADER: Título y Admin Edit */}
               <div className="relative">
                 {isAdmin ? (
                    <input 
                       value={currentProject.title}
                       onChange={(e) => handleEdit('title', e.target.value)}
                       className="w-full bg-transparent text-3xl md:text-4xl font-bold text-white border-b border-red-500/50 focus:outline-none focus:border-red-500 mb-4"
                    />
                 ) : (
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentProject.title}</h1>
                 )}
                 {isAdmin && <Pencil size={16} className="absolute top-2 right-0 text-red-500" />}
               </div>

               {/* 1. IMAGEN PRINCIPAL (Thumbnail en grande) */}
               <div className="relative w-full h-auto aspect-video rounded-lg overflow-hidden bg-gray-900">
                 <Image src={currentProject.thumbnail_url} alt={currentProject.title} width={1920} height={1080} className="object-contain w-full h-full" />
               </div>
               
               {/* 2. DESCRIPCIÓN Y TAGS */}
               <div className="bg-[#242424] p-6 rounded-lg border-l-4 border-red-600 relative">
                  {isAdmin ? (
                    <>
                      <textarea 
                        value={currentProject.description || ''}
                        onChange={(e) => handleEdit('description', e.target.value)}
                        className="w-full bg-transparent text-gray-300 focus:outline-none resize-none h-32 mb-4"
                        placeholder="Añade una descripción..."
                      />
                      <input 
                        value={currentProject.tags?.join(', ') || ''}
                        onChange={(e) => handleEdit('tags', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full bg-black/30 p-2 text-sm text-red-300 focus:outline-none rounded"
                        placeholder="Tags separados por comas (ej: 3D, Concept, Sci-Fi)"
                      />
                      <Pencil size={16} className="absolute top-4 right-4 text-red-500" />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 whitespace-pre-wrap mb-6">{currentProject.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.tags?.map((tag, index) => (
                          <span key={index} className="text-xs font-mono bg-black/50 text-red-400 px-3 py-1 rounded-full uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
               </div>

               {/* 3. GALERÍA VERTICAL (De arriba a abajo) */}
               <div className="flex flex-col gap-4 mt-8">
                 {currentProject.gallery.map((img) => (
                   <div key={img.id} className="relative w-full h-auto rounded-lg overflow-hidden bg-gray-900 shadow-lg">
                      {/* Usamos width/height arbitrarios altos para que Next.js lo optimice, pero CSS controla el aspect real */}
                      <Image 
                        src={img.image_url} 
                        alt={`Gallery element for ${currentProject.title}`}
                        width={1920}
                        height={1200}
                        className="w-full h-auto object-cover"
                      />
                      {isAdmin && (
                         <div className="absolute top-2 right-2 bg-red-600/80 text-white text-xs px-2 py-1 rounded pointer-events-none">
                            Admin View (Gallery ID: {img.id.slice(0,4)})
                         </div>
                      )}
                   </div>
                 ))}
                 {isAdmin && currentProject.gallery.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-gray-700 text-gray-500 text-center rounded-lg font-mono">
                       [ADMIN]: No hay imágenes de galería extra. Añádelas desde Supabase.
                    </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}