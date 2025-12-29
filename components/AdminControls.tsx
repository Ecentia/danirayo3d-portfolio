'use client';

import { useAdmin } from '@/context/AdminContext';

export default function AdminControls() {
  const { isAdmin, saveAllChanges, logout, isSaving, hasChanges } = useAdmin();

  // Si no es admin, este componente no renderiza nada
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Botón Guardar: Solo aparece si hay cambios pendientes */}
      {hasChanges && (
        <button
          onClick={saveAllChanges}
          disabled={isSaving}
          className="group flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-cyan-500/50 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed backdrop-blur-md border border-cyan-400/30"
        >
          {isSaving ? (
             <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span className="font-bold tracking-widest text-sm font-mono">SAVE_CHANGES</span>
            </>
          )}
        </button>
      )}

      {/* Botón Salir */}
      <button
        onClick={logout}
        className="group flex items-center justify-center gap-2 bg-black/80 hover:bg-red-950/80 text-gray-400 hover:text-red-400 px-6 py-3 rounded shadow-lg backdrop-blur-md border border-white/10 hover:border-red-500/30 transition-all active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span className="font-mono text-xs tracking-widest">LOGOUT</span>
      </button>
      
    </div>
  );
}