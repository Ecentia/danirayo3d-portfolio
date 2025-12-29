'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, X, Info } from 'lucide-react';

export const CURRENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG || 'danirayo';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }

interface AdminContextType {
  isAdmin: boolean;
  logout: () => Promise<void>;
  registerChange: (id: string, data: any) => void;
  registerNewProject: (data: any) => void;
  registerNewExperience: (data: any) => void;
  saveAllChanges: () => Promise<void>;
  deleteItem: (table: 'projects' | 'experience', id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>; // Alias para compatibilidad con tus componentes
  notify: (message: string, type?: ToastType) => void;
  hasChanges: boolean;
  isSaving: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [newProjects, setNewProjects] = useState<any[]>([]); 
  const [newExperience, setNewExperience] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  // --- NOTIFICACIONES ---
  const notify = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // --- AUTH ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
      if (!session) router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // --- REGISTROS ---
  const registerChange = (id: string, data: any) => {
    setPendingChanges(prev => ({ ...prev, [id]: { ...prev[id], ...data } }));
  };

  const registerNewProject = (data: any) => {
    setNewProjects(prev => [...prev, data]);
    notify("Proyecto en cola de guardado", 'info');
  };

  const registerNewExperience = (data: any) => {
    setNewExperience(prev => [...prev, data]);
    notify("Tarjeta de trayectoria en cola", 'info');
  };

  // --- BORRADO ---
  const deleteItem = async (table: 'projects' | 'experience', id: string) => {
    if (!confirm("⚠️ ¿Eliminar este elemento permanentemente?")) return;
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        notify("Elemento eliminado correctamente.", 'success');
        router.refresh();
    } catch (error: any) {
        notify("Error al eliminar: " + error.message, 'error');
    }
  };

  // Alias específico para proyectos para evitar errores de TS en tus componentes
  const deleteProject = (id: string) => deleteItem('projects', id);

  // --- GUARDADO MAESTRO ---
  const saveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0 && newProjects.length === 0 && newExperience.length === 0) {
        notify("No hay cambios pendientes", 'info');
        return;
    }
    setIsSaving(true);
    
    try {
      // 1. Insertar Nuevos Proyectos
      for (const draft of newProjects) {
          const { id: tempId, gallery, ...cleanData } = draft;
          const { data: inserted, error } = await supabase.from('projects').insert([{ ...cleanData, display_order: 0 }]).select().single();
          if (error) throw error;
          
          if (gallery?.length > 0 && inserted) {
              const galleryImages = gallery.map((img: any, idx: number) => ({
                  project_id: inserted.id, image_url: img.image_url, display_order: idx
              }));
              await supabase.from('project_gallery').insert(galleryImages);
          }
      }

      // 2. Insertar Nueva Experiencia
      if (newExperience.length > 0) {
        const cleanExperience = newExperience.map(({ id, ...rest }) => rest);
        const { error } = await supabase.from('experience').insert(cleanExperience);
        if (error) throw error;
      }

      // 3. Procesar Actualizaciones (Edición)
      const updatePromises = Object.entries(pendingChanges).map(async ([key, content]) => {
        if (key.startsWith('project_')) {
            const actualId = key.replace('project_', '');
            return supabase.from('projects').update(content).eq('id', actualId);
        } else if (key.startsWith('exp_')) {
            const actualId = key.replace('exp_', '');
            return supabase.from('experience').update(content).eq('id', actualId);
        } else {
            return supabase.from('portfolio_content').upsert(
                { client_slug: CURRENT_SLUG, section_id: key, ...content }, 
                { onConflict: 'client_slug, section_id' }
            );
        }
      });
      
      const results = await Promise.all(updatePromises);
      const firstError = results.find(r => r.error);
      if (firstError) throw firstError.error;
      
      // Limpiar estados locales tras éxito
      setPendingChanges({});
      setNewProjects([]);
      setNewExperience([]);
      notify("¡Sistema actualizado correctamente!", 'success');
      router.refresh();

    } catch (error: any) {
      console.error("Error en saveAllChanges:", error);
      notify("Error crítico: " + (error.message || "Fallo en la base de datos"), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  return (
    <AdminContext.Provider value={{ 
      isAdmin, logout, registerChange, registerNewProject, registerNewExperience, 
      saveAllChanges, deleteItem, deleteProject, notify, 
      hasChanges: Object.keys(pendingChanges).length > 0 || newProjects.length > 0 || newExperience.length > 0, 
      isSaving 
    }}>
      {children}
      
      {/* CONTENEDOR DE NOTIFICACIONES (TOASTS) */}
      <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded border backdrop-blur-md shadow-lg min-w-[300px]
                ${toast.type === 'success' ? 'bg-green-950/80 border-green-500/50 text-green-400' : ''}
                ${toast.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-400' : ''}
                ${toast.type === 'info' ? 'bg-blue-950/80 border-blue-500/50 text-blue-400' : ''}
              `}
            >
              {toast.type === 'success' && <Check size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
              <span className="text-xs font-mono tracking-wide">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-auto opacity-50 hover:opacity-100 p-1">
                <X size={14}/>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}