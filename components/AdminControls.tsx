'use client';

import { useAdmin } from '@/context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, ShieldCheck, Zap } from 'lucide-react';

export default function AdminControls() {
  const { 
    isAdmin, 
    hasChanges, 
    saveAllChanges, 
    isSaving, 
    isModalOpen 
  } = useAdmin();

  // Si no eres admin o hay un modal abierto, no mostramos nada
  if (!isAdmin || isModalOpen) return null;

  return (
    <AnimatePresence>
      {hasChanges && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-[150]"
        >
          <div className="relative group">
            {/* Brillo de alerta de cambios */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-40 group-hover:opacity-75 animate-pulse transition duration-1000"></div>
            
            <button
              onClick={saveAllChanges}
              disabled={isSaving}
              className="relative flex items-center gap-3 bg-zinc-950 border border-white/10 px-6 py-4 rounded-xl text-white shadow-2xl transition-all active:scale-95 disabled:opacity-70"
            >
              <div className="flex flex-col items-start mr-2">
                <span className="text-[8px] font-mono text-red-500 uppercase tracking-[0.3em] leading-none mb-1">
                  System_Status
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isSaving ? 'Sincronizando...' : 'Cambios Pendientes'}
                </span>
              </div>

              <div className={`p-2 rounded-lg ${isSaving ? 'bg-zinc-800' : 'bg-red-600'} transition-colors`}>
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
              </div>
            </button>
            
            {/* Badge de seguridad */}
            <div className="absolute -top-2 -left-2 bg-zinc-900 border border-white/10 p-1.5 rounded-lg shadow-lg">
              <ShieldCheck size={12} className="text-red-500" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Indicador de Modo Admin activo (Informativo) */}
      {!hasChanges && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="fixed bottom-8 right-8 z-[140] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
              Admin_Session_Active
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}