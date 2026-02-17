'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, UploadCloud, Trash2,
  Check, Plus, Layers, Calendar, Monitor,
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { FullProjectData, Project, GalleryImage } from '@/types/database';
import { useAdmin } from '@/context/AdminContext';
import {
  SiAdobeaftereffects, SiBlender, SiAutodeskmaya, SiAdobephotoshop,
  SiUnity, SiAdobepremierepro, SiAseprite, SiKrita,
} from 'react-icons/si';

// ─── Substance Icons ──────────────────────────────────────────────────────────
function SubstancePainterIcon({ className }: { className?: string }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded',
        'font-black leading-none select-none',
        'border-[1.5px] border-current',
        className ?? '',
      ].join(' ')}
      style={{ fontSize: '0.55em', width: '1.4em', height: '1.4em' }}
    >
      Pt
    </span>
  );
}

function SubstanceDesignerIcon({ className }: { className?: string }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded',
        'font-black leading-none select-none',
        'border-[1.5px] border-current',
        className ?? '',
      ].join(' ')}
      style={{ fontSize: '0.55em', width: '1.4em', height: '1.4em' }}
    >
      Ds
    </span>
  );
}

// ─── Software list ────────────────────────────────────────────────────────────
type AnyIcon = React.ComponentType<{ size?: number; className?: string }>;

type SoftwareEntry = { name: string; icon: AnyIcon };

const SOFTWARE_LIST: SoftwareEntry[] = [
  { name: 'After Effects',          icon: SiAdobeaftereffects as AnyIcon  },
  { name: 'Blender',               icon: SiBlender as AnyIcon            },
  { name: 'Maya',                  icon: SiAutodeskmaya as AnyIcon       },
  { name: 'Photoshop',             icon: SiAdobephotoshop as AnyIcon     },
  { name: 'Substance 3D Painter',  icon: SubstancePainterIcon            },
  { name: 'Substance 3D Designer', icon: SubstanceDesignerIcon           },
  { name: 'Unity',                 icon: SiUnity as AnyIcon              },
  { name: 'Premiere',              icon: SiAdobepremierepro as AnyIcon   },
  { name: 'Aseprite',              icon: SiAseprite as AnyIcon           },
  { name: 'Krita',                 icon: SiKrita as AnyIcon              },
];

// ─── Scrollbar ────────────────────────────────────────────────────────────────
const modernScrollbar =
  'overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-red-900/40 hover:[&::-webkit-scrollbar-thumb]:bg-red-600 [&::-webkit-scrollbar-thumb]:rounded-full';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId: string | null;
  allProjectsList: Project[];
}

export default function ProjectModal({
  isOpen,
  onClose,
  initialProjectId,
  allProjectsList,
}: ProjectModalProps) {
  type ProjectWithDate = (FullProjectData & { creation_date?: string }) | null;
  const [currentProject, setCurrentProject] = useState<ProjectWithDate>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<'thumbnail' | 'gallery'>('thumbnail');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { isAdmin, registerChange, registerNewProject, notify } = useAdmin();

  // ── Carga ──────────────────────────────────────────────────────────────────
  const loadProject = async (projectId: string) => {
    setLoading(true);
    const { data: projectData } = await supabase
      .from('projects').select('*').eq('id', projectId).single();
    const { data: galleryData } = await supabase
      .from('project_gallery').select('*').eq('project_id', projectId)
      .order('display_order', { ascending: true });
    if (projectData) setCurrentProject({ ...projectData, gallery: galleryData ?? [] });
    setLoading(false);
    if (imageContainerRef.current) imageContainerRef.current.scrollTop = 0;
  };

  const currentIndex = allProjectsList.findIndex((p) => p.id === currentProject?.id);
  const prevProject  = currentIndex > 0 ? allProjectsList[currentIndex - 1] : null;
  const nextProject  = currentIndex < allProjectsList.length - 1 ? allProjectsList[currentIndex + 1] : null;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialProjectId) {
        setIsCreationMode(false);
        loadProject(initialProjectId);
      } else {
        setIsCreationMode(true);
        setCurrentProject({
          id: 'temp-' + Date.now(),
          title: '', description: '', tags: [],
          thumbnail_url: '', display_order: 0,
          gallery: [],
          creation_date: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      document.body.style.overflow = 'unset';
      setCurrentProject(null);
      setTagInput('');
    }
  }, [isOpen, initialProjectId]);

  // ── Edición ────────────────────────────────────────────────────────────────
  const handleEdit = (field: keyof Project | 'creation_date', value: unknown) => {
    if (!currentProject || !isAdmin) return;
    setCurrentProject((prev) => (prev ? { ...prev, [field]: value } : null));
    if (!isCreationMode)
      registerChange(`project_${currentProject.id}`, { [field]: value });
  };

  const toggleSoftware = (name: string) => {
    if (!currentProject) return;
    const tags = currentProject.tags ?? [];
    handleEdit('tags', tags.includes(name) ? tags.filter((t) => t !== name) : [...tags, name]);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(',', '');
      if (tag && currentProject && !currentProject.tags?.includes(tag)) {
        handleEdit('tags', [...(currentProject.tags ?? []), tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    if (currentProject?.tags)
      handleEdit('tags', currentProject.tags.filter((t) => t !== tag));
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const triggerFileUpload = (target: 'thumbnail' | 'gallery') => {
    uploadTargetRef.current = target;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file || !currentProject) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const name = `${currentProject.id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('portfolio-images').upload(name, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(name);

      if (uploadTargetRef.current === 'thumbnail') {
        handleEdit('thumbnail_url', publicUrl);
        notify('Miniatura actualizada', 'success');
      } else {
        const newImg: GalleryImage = {
          id: `temp-img-${Date.now()}`,
          project_id: currentProject.id,
          image_url: publicUrl,
          display_order: currentProject.gallery.length,
        };
        setCurrentProject({ ...currentProject, gallery: [...currentProject.gallery, newImg] });
        if (!isCreationMode) {
          await supabase.from('project_gallery').insert({
            project_id: currentProject.id,
            image_url: publicUrl,
            display_order: newImg.display_order,
          });
          const { data: fresh } = await supabase
            .from('project_gallery').select('*').eq('project_id', currentProject.id)
            .order('display_order', { ascending: true });
          if (fresh)
            setCurrentProject((prev) => (prev ? { ...prev, gallery: fresh } : null));
        }
        notify('Imagen añadida', 'success');
        setTimeout(() => {
          imageContainerRef.current?.scrollTo({
            top: imageContainerRef.current.scrollHeight, behavior: 'smooth',
          });
        }, 100);
      }
    } catch (err: unknown) {
      notify('Error: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!currentProject || !isAdmin || !confirm('¿Eliminar imagen?')) return;
    if (isCreationMode || imageId.startsWith('temp-')) {
      setCurrentProject({
        ...currentProject,
        gallery: currentProject.gallery.filter((img) => img.id !== imageId),
      });
    } else {
      const { error } = await supabase.from('project_gallery').delete().eq('id', imageId);
      if (!error) {
        setCurrentProject({
          ...currentProject,
          gallery: currentProject.gallery.filter((img) => img.id !== imageId),
        });
        notify('Imagen eliminada', 'info');
      }
    }
  };

  const handleConfirmNewProject = () => {
    if (!currentProject?.thumbnail_url || !currentProject.title) {
      notify('Falta Título o Portada', 'error');
      return;
    }
    registerNewProject(currentProject);
    onClose();
  };

  if (!isOpen || !currentProject) return null;

  const contentImages = [
    ...(currentProject.thumbnail_url
      ? [{ id: 'thumb', image_url: currentProject.thumbnail_url, isThumbnail: true }]
      : []),
    ...currentProject.gallery,
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {/* z-[500] supera al header z-[100] */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 md:p-6"
        onClick={onClose}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[520] bg-black/80 border border-white/10 hover:border-red-500/50 text-white/50 hover:text-red-400 rounded-full p-2 transition-all"
        >
          <X size={20} />
        </button>

        {/* Nav prev/next */}
        {!isCreationMode && prevProject && (
          <button
            onClick={(e) => { e.stopPropagation(); loadProject(prevProject.id); }}
            className="fixed left-2 top-1/2 -translate-y-1/2 z-[510] hidden md:flex text-white/20 hover:text-white p-3 transition-all hover:scale-110"
          >
            <ChevronLeft size={44} />
          </button>
        )}
        {!isCreationMode && nextProject && (
          <button
            onClick={(e) => { e.stopPropagation(); loadProject(nextProject.id); }}
            className="fixed right-2 top-1/2 -translate-y-1/2 z-[510] hidden md:flex text-white/20 hover:text-white p-3 transition-all hover:scale-110"
          >
            <ChevronRight size={44} />
          </button>
        )}

        {/* Contenedor modal */}
        <motion.div
          initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
          className="bg-[#050505] w-full max-w-[1600px] h-full md:h-[90vh] md:rounded-lg border border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-[510]"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="file" ref={fileInputRef} className="hidden" accept="image/*"
            onChange={handleFileChange} onClick={(e) => e.stopPropagation()}
          />

          {/* ── Izquierda: imágenes ── */}
          <div ref={imageContainerRef} className={`flex-1 bg-black relative ${modernScrollbar}`}>
            <div className="p-4 md:p-8 pb-20 flex flex-col gap-4 min-h-full">
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-red-500 font-mono text-sm animate-pulse">
                  LOADING DATA...
                </div>
              )}

              {contentImages.length === 0 && isAdmin && (
                <button
                  onClick={() => triggerFileUpload('thumbnail')}
                  className="flex-1 min-h-[50vh] border-2 border-dashed border-zinc-800 hover:border-red-900 rounded-lg flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-red-500 transition-all group"
                >
                  <UploadCloud size={56} className="group-hover:scale-110 transition-transform" />
                  <span className="font-mono tracking-widest text-sm">UPLOAD COVER ART</span>
                </button>
              )}

              {contentImages.length === 0 && !isAdmin && !loading && (
                <div className="flex-1 min-h-[40vh] flex items-center justify-center text-zinc-700 font-mono text-sm">
                  NO_IMAGES_FOUND
                </div>
              )}

              {contentImages.map((img, i) => (
                <div key={img.id} className="relative w-full bg-zinc-900/20 group rounded-sm overflow-hidden">
                  <Image
                    src={img.image_url} alt={`Asset ${i}`}
                    width={1920} height={1200}
                    className="w-full h-auto object-contain shadow-xl"
                    priority={i === 0}
                  />
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(img as { isThumbnail?: boolean }).isThumbnail ? (
                        <button
                          onClick={() => triggerFileUpload('thumbnail')}
                          className="bg-black/80 text-white p-2 rounded hover:bg-red-600 transition-colors border border-white/10"
                        >
                          <UploadCloud size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteGalleryImage(img.id)}
                          className="bg-black/80 text-white p-2 rounded hover:bg-red-600 transition-colors border border-white/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                  {(img as { isThumbnail?: boolean }).isThumbnail && (
                    <div className="absolute bottom-3 left-3 bg-red-600/90 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider pointer-events-none">
                      Cover Art
                    </div>
                  )}
                </div>
              ))}

              {isAdmin && currentProject.thumbnail_url && (
                <button
                  onClick={() => triggerFileUpload('gallery')}
                  disabled={uploading}
                  className="w-full py-14 border-2 border-dashed border-zinc-900 hover:border-red-900/50 rounded-lg flex flex-col items-center justify-center text-zinc-700 hover:text-red-500 transition-all mt-2 group"
                >
                  {uploading
                    ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
                    : <Plus size={36} strokeWidth={1} className="group-hover:scale-110 transition-transform" />}
                  <span className="text-[10px] font-mono mt-3 uppercase tracking-[0.2em]">
                    {uploading ? 'UPLOADING...' : 'ADD GALLERY IMAGE'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ── Derecha: sidebar ── */}
          <div className={`w-full md:w-[400px] lg:w-[440px] bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/5 flex flex-col ${modernScrollbar}`}>

            {isAdmin && (
              <div className="p-4 bg-zinc-900/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  <div className={`w-2 h-2 rounded-full ${isCreationMode ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                  {isCreationMode ? 'Creating New Entity' : 'Edit Mode Active'}
                </div>
                {isCreationMode && (
                  <button
                    onClick={handleConfirmNewProject}
                    className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded text-xs font-bold transition-all"
                  >
                    <Check size={14} /> CONFIRM AND CREATE DRAFT
                  </button>
                )}
              </div>
            )}

            <div className="p-6 md:p-8 flex flex-col gap-6">

              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-black border border-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  {isAdmin ? (
                    <input
                      value={currentProject.title}
                      onChange={(e) => handleEdit('title', e.target.value)}
                      placeholder="NOMBRE DEL PROYECTO"
                      className="w-full bg-transparent text-xl font-bold text-white border-b border-zinc-800 focus:border-red-500 outline-none py-1 placeholder-zinc-700"
                    />
                  ) : (
                    <h1 className="text-xl md:text-2xl font-bold text-white leading-tight break-words">
                      {currentProject.title}
                    </h1>
                  )}
                  <p className="text-xs text-zinc-500 mt-1 font-mono">by Daniel Rayo</p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Fecha */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={12} /> Date
                </h3>
                {isAdmin ? (
                  <input
                    type="date"
                    value={currentProject.creation_date ?? ''}
                    onChange={(e) => handleEdit('creation_date', e.target.value)}
                    className="w-full bg-black/30 border border-zinc-800 p-2 text-xs text-white rounded focus:border-red-500 outline-none font-mono"
                  />
                ) : (
                  <p className="text-xs text-zinc-400 font-mono">
                    {currentProject.creation_date
                      ? new Date(currentProject.creation_date).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long',
                        })
                      : 'DATE_UNKNOWN'}
                  </p>
                )}
              </div>

              {/* Software */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Monitor size={12} /> Software Used
                </h3>

                {isAdmin ? (
                  <div className="grid grid-cols-5 gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                    {SOFTWARE_LIST.map((soft) => {
                      const IconComp = soft.icon;
                      const selected = currentProject.tags?.includes(soft.name);
                      return (
                        <button
                          key={soft.name}
                          onClick={() => toggleSoftware(soft.name)}
                          title={soft.name}
                          className={[
                            'flex items-center justify-center p-2 rounded aspect-square transition-all text-xl',
                            selected
                              ? 'bg-red-900/30 border border-red-500 text-red-400'
                              : 'bg-zinc-900/50 border border-transparent text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800',
                          ].join(' ')}
                        >
                          <IconComp size={20} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {SOFTWARE_LIST.filter((s) => currentProject.tags?.includes(s.name)).map((soft) => {
                      const IconComp = soft.icon;
                      return (
                        <div
                          key={soft.name}
                          title={soft.name}
                          className="bg-zinc-900 p-2.5 rounded border border-white/5 hover:border-red-500/40 transition-colors text-zinc-400 hover:text-white cursor-default text-xl"
                        >
                          <IconComp size={20} />
                        </div>
                      );
                    })}
                    {!currentProject.tags?.some((t) => SOFTWARE_LIST.some((s) => s.name === t)) && (
                      <p className="text-xs text-zinc-600 font-mono">NO_SOFTWARE_TAGGED</p>
                    )}
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Briefing</h3>
                {isAdmin ? (
                  <textarea
                    value={currentProject.description ?? ''}
                    onChange={(e) => handleEdit('description', e.target.value)}
                    placeholder="Escribe la descripción..."
                    className="w-full h-32 bg-black/30 p-3 rounded text-sm text-zinc-300 outline-none border border-zinc-800 focus:border-red-500 resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {currentProject.description ?? (
                      <span className="text-zinc-600 italic">Sin descripción.</span>
                    )}
                  </p>
                )}
              </div>

              {/* Otros tags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={12} /> Other Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProject.tags
                    ?.filter((t) => !SOFTWARE_LIST.some((s) => s.name === t))
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded"
                      >
                        {tag}
                        {isAdmin && (
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-0.5">
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                </div>
                {isAdmin && (
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-black/30 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-red-500 rounded"
                    placeholder="Escribe tag y pulsa Enter..."
                  />
                )}
              </div>

              <div className="pt-4 text-[10px] text-zinc-700 font-mono text-center">
                PUBLISHED VIA SYSTEM_ADMIN_V1
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}