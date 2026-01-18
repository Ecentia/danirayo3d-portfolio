'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, UploadCloud, Trash2, Check, Plus, Layers, Calendar, Monitor } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { FullProjectData, Project, GalleryImage } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';

// --- ICONOS DE SOFTWARE ---
import { 
  SiAdobeaftereffects, SiBlender, SiAutodeskmaya, SiAdobephotoshop, 
  SiUnity, SiAdobepremierepro, 
  SiAseprite, SiKrita 
} from 'react-icons/si';

const SubstanceDesignerIcon = (props: any) => (
  <svg viewBox="0 0 512.47 499.66" fill="currentColor" width="1.3em" height="1.3em" {...props}>
    <defs>
      <mask id="mask-substance-designer">
        <rect width="512.47" height="499.66" rx="90.75" fill="white" />
        <g fill="black">
          <path d="M94.15,349.71V131.06a2.5,2.5,0,0,1,2.25-2.74h.16c3.43-.23,8.48-.4,15.12-.52s14.44-.22,23.38-.34,18.45-.17,28.53-.17q41.26,0,68.42,14.09a95.24,95.24,0,0,1,40.74,38.68q13.58,24.58,13.57,56.55a126,126,0,0,1-7,43.83A102.3,102.3,0,0,1,260,313.26a114.64,114.64,0,0,1-27.68,22.87,121.52,121.52,0,0,1-33,13.4,145.18,145.18,0,0,1-34.72,4.3H139q-13.57,0-25.26-.17t-17.54-.52C94.84,353.14,94.15,352,94.15,349.71Zm47.44-180.15V311.89q3.78,0,6.88.17l6.36.34c2.17.12,4.64.18,7.39.18a92.25,92.25,0,0,0,30.6-4.82,62.51,62.51,0,0,0,23.54-14.43,64.82,64.82,0,0,0,15.13-23.73,90,90,0,0,0,5.33-32,80.65,80.65,0,0,0-5.16-30.08,56.9,56.9,0,0,0-14.95-21.66A61.33,61.33,0,0,0,193.33,173a102.07,102.07,0,0,0-29.74-4.12c-4.58,0-8.42.05-11.51.17s-6.59.29-10.49.51Z"/>
          <path d="M421.43,227A80.53,80.53,0,0,0,401,219.76,108.56,108.56,0,0,0,377.08,217a44.93,44.93,0,0,0-12.9,1.55,11.62,11.62,0,0,0-6.7,4.3,10.8,10.8,0,0,0-1.72,5.84,9.19,9.19,0,0,0,2.06,5.5,23.59,23.59,0,0,0,7.22,5.68,144.12,144.12,0,0,0,15.13,7A150.13,150.13,0,0,1,413,262.56a49.88,49.88,0,0,1,16.85,17.7,47.26,47.26,0,0,1,5,22,49.39,49.39,0,0,1-8.25,28.37,54.32,54.32,0,0,1-23.89,19.08Q387,356.58,364,356.58A139.59,139.59,0,0,1,335,353.83a83,83,0,0,1-20.8-6.87,4.46,4.46,0,0,1-2.4-4.13V305.7a2,2,0,0,1,.86-1.89,1.68,1.68,0,0,1,1.89.17A85.46,85.46,0,0,0,340,314.47,108.91,108.91,0,0,0,365,317.73q12,0,17.71-3.09a9.72,9.72,0,0,0,5.67-8.94q0-4.45-5.15-8.59t-21-10a126.39,126.39,0,0,1-30.42-15.47,52.63,52.63,0,0,1-16.16-18.05,47.37,47.37,0,0,1-5-21.83A49.3,49.3,0,0,1,318,206a52.41,52.41,0,0,1,22.34-19.59q15.12-7.56,37.82-7.56a166.33,166.33,0,0,1,26.47,1.89,64.64,64.64,0,0,1,17.88,5,3.13,3.13,0,0,1,2.06,1.89,9.38,9.38,0,0,1,.34,2.58v34.72a2.32,2.32,0,0,1-1,2.07A2.26,2.26,0,0,1,421.43,227Z"/>
        </g>
      </mask>
    </defs>
    <rect width="512.47" height="499.66" rx="90.75" fill="currentColor" mask="url(#mask-substance-designer)" />
  </svg>
);

const SubstancePainterIcon = (props: any) => (
  <svg viewBox="0 0 512.47 499.66" fill="currentColor" width="1.3em" height="1.3em" {...props}>
    <defs>
      <mask id="mask-substance-painter">
        <path d="M90.75,0h331a90.75,90.75,0,0,1,90.75,90.75V408.91a90.75,90.75,0,0,1-90.75,90.75h-331A90.75,90.75,0,0,1,0,408.91V90.75A90.75,90.75,0,0,1,90.75,0Z" fill="white"/>
        <g fill="black">
          <path d="M110.85,350.39V130.71c0-1.6.68-2.4,2.06-2.4q5.49,0,13.06-.17t16.33-.35l18.57-.34q9.8-.18,19.42-.18,26.13,0,44,6.54A76.18,76.18,0,0,1,253,151.34a67.28,67.28,0,0,1,15.64,24.24,80.35,80.35,0,0,1,4.82,27.67q0,27.51-12.72,45.38a72,72,0,0,1-34.38,26,137.05,137.05,0,0,1-48.13,8.08q-7.57,0-10.66-.18c-2.06-.11-5.16-.17-9.28-.17v67.73a2.74,2.74,0,0,1-2.32,3.09,2.49,2.49,0,0,1-.77,0H113.25C111.65,353.14,110.85,352.23,110.85,350.39Zm47.44-180.83v71.17q4.46.35,8.25.34h11.34a81.19,81.19,0,0,0,24.58-3.44A37.11,37.11,0,0,0,220,226.29q6.7-7.9,6.7-22a34.81,34.81,0,0,0-5-18.9,32.14,32.14,0,0,0-15-12.21,63.8,63.8,0,0,0-25.09-4.29q-8.25,0-14.61.17t-8.77.51Z"/>
          <path d="M401,319.11V347.3q0,3.78-2.75,4.47a122.82,122.82,0,0,1-13.75,3.44A88.75,88.75,0,0,1,368,356.58q-22.35,0-35.06-11.69t-12.72-37.47V222.16H299.92c-1.83,0-2.75-1-2.75-3.09V185c0-1.83,1-2.75,3.1-2.75h20.28q.34-5.84.86-13.58c.35-5.15.8-10.31,1.38-15.47s1.08-9.34,1.54-12.54a6.09,6.09,0,0,1,1-1.89,3.74,3.74,0,0,1,1.72-1.21L368,132.44a2.87,2.87,0,0,1,1.89.09c.46.23.52.83.52,2q-.69,7.91-1,21.49t-.69,26.29h32c1.38,0,2.07.92,2.07,2.75v34.73a2.12,2.12,0,0,1-1.72,2.4H368.34v73.57q0,11.7,4,16.68t14.61,5c2.06,0,4-.05,5.85-.17s3.66-.29,5.5-.52a2.21,2.21,0,0,1,1.89.17A2.44,2.44,0,0,1,401,319.11Z"/>
        </g>
      </mask>
    </defs>
    <path d="M90.75,0h331a90.75,90.75,0,0,1,90.75,90.75V408.91a90.75,90.75,0,0,1-90.75,90.75h-331A90.75,90.75,0,0,1,0,408.91V90.75A90.75,90.75,0,0,1,90.75,0Z" fill="currentColor" mask="url(#mask-substance-painter)"/>
  </svg>
);

const SOFTWARE_LIST = [
  { name: 'After Effects', icon: SiAdobeaftereffects },
  { name: 'Blender', icon: SiBlender },
  { name: 'Maya', icon: SiAutodeskmaya },
  { name: 'Photoshop', icon: SiAdobephotoshop },
  { name: 'Substance 3D Painter', icon: SubstancePainterIcon },
  { name: 'Substance 3D Designer', icon: SubstanceDesignerIcon },
  { name: 'Unity', icon: SiUnity },
  { name: 'Premiere', icon: SiAdobepremierepro },
  { name: 'Aseprite', icon: SiAseprite },
  { name: 'Krita', icon: SiKrita },
];

const modernScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-red-900/40 hover:[&::-webkit-scrollbar-thumb]:bg-red-600 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId: string | null;
  allProjectsList: Project[];
}

export default function ProjectModal({ isOpen, onClose, initialProjectId, allProjectsList }: ProjectModalProps) {
  const [currentProject, setCurrentProject] = useState<(FullProjectData & { creation_date?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<'thumbnail' | 'gallery'>('thumbnail');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { isAdmin, registerChange, registerNewProject, notify, setIsModalOpen } = useAdmin();

  // --- FIX DE OCULTAR HEADER Y BLOQUEO DE SCROLL ---
  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsModalOpen(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, setIsModalOpen]);

  // --- CIERRE AL NAVEGAR (HASH CHANGE) ---
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) onClose();
    };
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, [isOpen, onClose]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    const { data: projectData } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const { data: galleryData } = await supabase.from('project_gallery').select('*').eq('project_id', projectId).order('display_order', { ascending: true });

    if (projectData) {
      setCurrentProject({ ...projectData, gallery: galleryData || [] });
    }
    setLoading(false);
    if(imageContainerRef.current) imageContainerRef.current.scrollTop = 0;
  };

  const currentIndex = allProjectsList.findIndex(p => p.id === currentProject?.id);
  const prevProject = currentIndex > 0 ? allProjectsList[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjectsList.length - 1 ? allProjectsList[currentIndex + 1] : null;

  const handleNavigate = (projectId: string) => {
    loadProject(projectId);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setIsCreationMode(false);
        loadProject(initialProjectId);
      } else {
        setIsCreationMode(true);
        setCurrentProject({
          id: 'temp-' + Date.now(),
          title: '',
          description: '',
          tags: [],
          thumbnail_url: '',
          display_order: 0,
          gallery: [],
          creation_date: new Date().toISOString().split('T')[0]
        });
      }
    } else {
      setCurrentProject(null);
      setTagInput('');
    }
  }, [isOpen, initialProjectId]);

  const handleEdit = (field: keyof Project | 'creation_date', value: any) => {
    if (!currentProject || !isAdmin) return;
    setCurrentProject(prev => prev ? ({ ...prev, [field]: value }) : null);
    if (!isCreationMode) registerChange(`project_${currentProject.id}`, { [field]: value });
  };

  const toggleSoftware = (softwareName: string) => {
    if (!currentProject) return;
    const currentTags = currentProject.tags || [];
    let newTags;
    if (currentTags.includes(softwareName)) {
      newTags = currentTags.filter(t => t !== softwareName);
    } else {
      newTags = [...currentTags, softwareName];
    }
    handleEdit('tags', newTags);
  };

  const triggerFileUpload = (target: 'thumbnail' | 'gallery') => {
    uploadTargetRef.current = target;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentProject) return;
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentProject.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      if (uploadTargetRef.current === 'thumbnail') {
        handleEdit('thumbnail_url', publicUrl);
        notify("Portada actualizada", 'success');
      } else {
        const newImage: GalleryImage = {
          id: `temp-img-${Date.now()}`,
          project_id: currentProject.id,
          image_url: publicUrl,
          display_order: currentProject.gallery.length
        };
        const newGallery = [...currentProject.gallery, newImage];
        setCurrentProject({ ...currentProject, gallery: newGallery });
        if (!isCreationMode) {
            await supabase.from('project_gallery').insert({
                project_id: currentProject.id,
                image_url: publicUrl,
                display_order: newImage.display_order
            });
            const { data: refreshedGallery } = await supabase.from('project_gallery').select('*').eq('project_id', currentProject.id).order('display_order', { ascending: true });
            if (refreshedGallery) setCurrentProject(prev => prev ? ({ ...prev, gallery: refreshedGallery }) : null);
        }
        notify("Imagen añadida", 'success');
      }
    } catch (error: any) {
      notify('Error: ' + error.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!currentProject || !isAdmin || !confirm("¿Eliminar imagen?")) return;
    if (isCreationMode || imageId.startsWith('temp-')) {
        setCurrentProject({ ...currentProject, gallery: currentProject.gallery.filter(img => img.id !== imageId) });
    } else {
        const { error } = await supabase.from('project_gallery').delete().eq('id', imageId);
        if (!error) {
            setCurrentProject({ ...currentProject, gallery: currentProject.gallery.filter(img => img.id !== imageId) });
            notify("Imagen eliminada", 'info');
        }
    }
  };

  const handleConfirmNewProject = () => {
    if (!currentProject?.thumbnail_url || !currentProject.title) {
        notify("Falta Título o Portada", 'error');
        return;
    }
    registerNewProject(currentProject);
    onClose();
  };

  if (!isOpen || !currentProject) return null;

  const contentImages = [
    ...(currentProject.thumbnail_url ? [{ id: 'thumb', image_url: currentProject.thumbnail_url, isThumbnail: true }] : []),
    ...currentProject.gallery
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex justify-center items-center p-0 md:p-6"
        onClick={onClose}
      >
        <button onClick={onClose} className="absolute top-4 right-4 md:right-8 text-white/50 hover:text-red-500 z-[230] bg-black/50 rounded-full p-2 backdrop-blur transition-all">
          <X size={28} />
        </button>

        {!isCreationMode && prevProject && (
          <button onClick={(e) => { e.stopPropagation(); handleNavigate(prevProject.id); }} className="fixed left-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white p-4 z-[230] hidden md:block transition-all hover:scale-110">
            <ChevronLeft size={48} />
          </button>
        )}
        {!isCreationMode && nextProject && (
          <button onClick={(e) => { e.stopPropagation(); handleNavigate(nextProject.id); }} className="fixed right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white p-4 z-[230] hidden md:block transition-all hover:scale-110">
            <ChevronRight size={48} />
          </button>
        )}

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#050505] w-full max-w-[1400px] h-full md:h-[90vh] md:rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative z-[220]"
          onClick={(e) => e.stopPropagation()} 
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          
          <div ref={imageContainerRef} className={`flex-1 bg-black relative ${modernScrollbar}`}>
            <div className="p-4 md:p-8 flex flex-col gap-6 min-h-full">
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 text-red-500 font-mono animate-pulse uppercase tracking-[0.3em]">Cargando Datos...</div>}

                {contentImages.length === 0 && isAdmin && (
                    <button onClick={() => triggerFileUpload('thumbnail')} className="flex-1 min-h-[40vh] border-2 border-dashed border-zinc-800 hover:border-red-600 rounded-xl flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-red-500 transition-all">
                       <UploadCloud size={48} />
                       <span className="font-mono text-xs uppercase tracking-widest">Subir Imagen de Portada</span>
                    </button>
                )}

                {contentImages.map((img, index) => (
                  <div key={img.id} className="relative w-full group overflow-hidden rounded-lg">
                    <Image src={img.image_url} alt={`Asset ${index}`} width={1200} height={800} className="w-full h-auto object-contain shadow-2xl" priority={index === 0} />
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {(img as any).isThumbnail ? (
                             <button onClick={() => triggerFileUpload('thumbnail')} className="bg-black/80 text-white p-2 rounded-lg hover:bg-red-600 transition-colors border border-white/10"><UploadCloud size={16} /></button>
                         ) : (
                             <button onClick={() => handleDeleteGalleryImage(img.id)} className="bg-black/80 text-white p-2 rounded-lg hover:bg-red-600 transition-colors border border-white/10"><Trash2 size={16} /></button>
                         )}
                      </div>
                    )}
                    {(img as any).isThumbnail && <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Portada</div>}
                  </div>
                ))}

                {isAdmin && currentProject.thumbnail_url && (
                   <button onClick={() => triggerFileUpload('gallery')} disabled={uploading} className="w-full py-20 border-2 border-dashed border-zinc-900 hover:border-red-900/50 rounded-xl flex flex-col items-center justify-center text-zinc-700 hover:text-red-500 transition-all mt-4">
                      {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /> : <Plus size={32} />}
                      <span className="text-[10px] font-mono mt-4 uppercase tracking-[0.2em]">{uploading ? 'Subiendo...' : 'Añadir a la Galería'}</span>
                   </button>
                )}
            </div>
          </div>

          <div className={`w-full md:w-[400px] bg-[#0A0A0A] border-l border-white/5 flex flex-col ${modernScrollbar}`}>
             {isAdmin && (
                 <div className="p-5 bg-red-600/10 border-b border-red-600/20 flex flex-col gap-4 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold">
                       <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                       Modo Edición Activo
                    </div>
                    {isCreationMode && (
                      <button onClick={handleConfirmNewProject} className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-xs font-black transition-all shadow-xl">
                        <Check size={14} /> GUARDAR PROYECTO
                      </button>
                    )}
                 </div>
             )}

             <div className="p-8 flex flex-col gap-10">
                 <div className="flex flex-col gap-4">
                    <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Project_Details</div>
                    {isAdmin ? (
                       <input value={currentProject.title} onChange={(e) => handleEdit('title', e.target.value)} placeholder="Título del proyecto" className="w-full bg-transparent text-3xl font-black text-white border-b border-zinc-800 focus:border-red-600 focus:outline-none py-2 placeholder-zinc-800" />
                    ) : (
                       <h1 className="text-3xl font-black text-white leading-none tracking-tighter uppercase">{currentProject.title}</h1>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Fecha</h3>
                        {isAdmin ? (
                             <input type="date" value={currentProject.creation_date || ''} onChange={(e) => handleEdit('creation_date', e.target.value)} className="bg-zinc-900 border border-zinc-800 p-2 text-xs text-white rounded-lg focus:border-red-600 focus:outline-none w-full font-mono uppercase" />
                        ) : (
                            <p className="text-sm text-white font-mono">{currentProject.creation_date || 'N/A'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Monitor size={12}/> Rol</h3>
                        <p className="text-sm text-white font-mono">3D Artist</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stack Tecnológico</h3>
                    {isAdmin && (
                        <div className="grid grid-cols-5 gap-2 bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                            {SOFTWARE_LIST.map((soft) => {
                                const isSelected = currentProject.tags?.includes(soft.name);
                                return (
                                    <button key={soft.name} onClick={() => toggleSoftware(soft.name)} className={`flex items-center justify-center p-2 rounded-lg transition-all aspect-square ${isSelected ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-950 text-zinc-600 hover:text-zinc-300'}`} title={soft.name}>
                                        <soft.icon size={20} />
                                    </button>
                                )
                            })}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                        {SOFTWARE_LIST.filter(s => currentProject.tags?.includes(s.name)).map(soft => (
                            <div key={soft.name} className="p-2.5 bg-zinc-900 rounded-xl border border-white/5 text-zinc-400" title={soft.name}>
                                <soft.icon size={20} />
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descripción del Proyecto</h3>
                    {isAdmin ? (
                      <textarea value={currentProject.description || ''} onChange={(e) => handleEdit('description', e.target.value)} placeholder="Breve briefing..." className="w-full h-40 bg-zinc-900/50 p-4 rounded-xl text-sm text-zinc-300 focus:outline-none border border-zinc-800 focus:border-red-600 resize-none leading-relaxed" />
                    ) : (
                      <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{currentProject.description}</p>
                    )}
                 </div>

                 <div className="mt-auto pt-10 border-t border-white/5 text-[9px] text-zinc-700 font-mono text-center uppercase tracking-[0.2em]">
                    Copyright © {new Date().getFullYear()} Daniel Rayo
                 </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}