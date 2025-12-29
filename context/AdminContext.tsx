'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Slug del cliente actual (desde .env o por defecto)
export const CURRENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG || 'danirayo';

interface AdminContextType {
  isAdmin: boolean;
  logout: () => Promise<void>;
  registerChange: (sectionId: string, data: any) => void;
  saveAllChanges: () => Promise<void>;
  hasChanges: boolean;
  isSaving: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  // Almacena los cambios pendientes: { "about_me": { title: "Nuevo Titulo" }, ... }
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // 1. GESTIÓN DE SESIÓN
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

  // 2. REGISTRAR UN CAMBIO (Sin guardar todavía)
  const registerChange = (sectionId: string, data: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...data }
    }));
  };

  // 3. GUARDAR TODO EN SUPABASE (Usando tu tabla nueva)
  const saveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    
    setIsSaving(true);
    
    // Verificamos sesión (aunque RLS también protege)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert("Tu sesión ha expirado. Por favor recarga.");
        setIsSaving(false);
        return;
    }

    try {
      // Preparamos las promesas de guardado para cada sección modificada
      const promises = Object.entries(pendingChanges).map(([sectionId, content]) => {
        // Upsert usando tu constraint única (client_slug + section_id)
        return supabase.from('portfolio_content').upsert({
          client_slug: CURRENT_SLUG,
          section_id: sectionId,
          // No hace falta pasar owner_id, tu tabla lo pone por defecto con auth.uid()
          ...content
        }, { 
          onConflict: 'client_slug, section_id' // Clave para que funcione tu constraint
        });
      });

      await Promise.all(promises);
      
      setPendingChanges({}); // Limpiamos la cola de cambios
      alert("¡Cambios guardados correctamente en la base de datos!");
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar: " + error.message);
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
      isAdmin, 
      logout, 
      registerChange, 
      saveAllChanges, 
      isSaving,
      hasChanges: Object.keys(pendingChanges).length > 0 
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}