'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Code2, 
  Briefcase, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Save, 
  Loader2,
  Terminal,
  LayoutDashboard,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdmin, CURRENT_SLUG } from '@/context/AdminContext';

// Importación de Managers locales (Asegúrate de haber creado estos archivos en la misma carpeta)
import TechManager from '@/app/admin/TechManager';
import ExperienceManager from '@/app/admin/ExperienceManager';

export default function AdminPage() {
  const { 
    isAdmin, 
    isLoading, 
    logout, 
    saveAllChanges, 
    hasChanges, 
    isSaving,
    notify 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'tech' | 'experience' | 'projects'>('tech');
  
  // Estados para el Formulario de Acceso
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      notify("ERROR_AUTH: Credenciales no válidas", 'error');
    } else {
      notify("SISTEMA_DESBLOQUEADO", 'success');
      // No necesitamos redirigir, AdminContext actualizará el estado isAdmin y la UI cambiará sola
    }
    setAuthLoading(false);
  };

  // 1. PANTALLA DE CARGA (Evita el parpadeo de hidratación y bucles)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="text-red-600 animate-spin" size={48} />
          <div className="absolute inset-0 blur-2xl bg-red-600/20 animate-pulse"></div>
        </div>
        <span className="text-red-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
          Validando_Acceso_Root...
        </span>
      </div>
    );
  }

  // 2. VISTA DE LOGIN (Si no hay sesión activa)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Capas decorativas de fondo */}
        <div className="scanlines opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/[0.03] blur-[150px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative"
        >
          <div className="flex justify-between items-end px-2 mb-2">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-red-600" />
              <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest">Security_Terminal_v4.2</span>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-4 mb-1"></div>
            <span className="text-zinc-800 font-mono text-[9px]">ENCRYPTED_NODE</span>
          </div>

          <div className="bg-zinc-950/80 border border-white/[0.05] backdrop-blur-2xl p-8 md:p-12 rounded-2xl shadow-2xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-red-600/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-red-600/30 rounded-br-2xl" />

            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-2xl bg-red-600/10 border border-red-600/20 mb-6 group">
                <Lock size={32} className="text-red-600 transition-transform group-hover:scale-110" />
              </div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                RESTRICTED <span className="text-red-600">AREA</span>
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-red-500 transition-colors">
                    IDENTIFIER_ID
                  </label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-red-600/50 focus:bg-black/60 transition-all font-mono"
                    placeholder=" " 
                  />
                </div>
                
                <div className="group">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-red-500 transition-colors">
                    ACCESS_KEY_SECRET
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-red-600/50 focus:bg-black/60 transition-all font-mono"
                      placeholder=" "
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={authLoading}
                className="w-full py-5 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {authLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>BYPASS FIREWALL <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-zinc-700 font-mono text-[8px] uppercase tracking-[0.4em]">ADMINISTRATION_PROTOCOL_REQUIRED</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. VISTA DEL PANEL DE CONTROL (Si hay sesión de Administrador)
  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col md:flex-row">
      
      {/* Sidebar de Navegación Lateral */}
      <aside className="w-full md:w-72 bg-[#080808] border-r border-white/5 flex flex-col p-8 z-30">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase italic leading-none">Admin_Portal</span>
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-1">Status: Online</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('tech')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'tech' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-zinc-600 hover:text-white hover:bg-zinc-900/50'}
            `}
          >
            <Code2 size={18} /> Software_Arsenal
          </button>
          
          <button 
            onClick={() => setActiveTab('experience')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'experience' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-zinc-600 hover:text-white hover:bg-zinc-900/50'}
            `}
          >
            <Briefcase size={18} /> Trayectoria
          </button>

          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'projects' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-zinc-600 hover:text-white hover:bg-zinc-900/50'}
            `}
          >
            <LayoutDashboard size={18} /> Gestión_Proyectos
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-600 hover:text-red-500 hover:bg-red-950/10 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={18} /> Terminar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Trabajo Principal */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto relative custom-scrollbar">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto">
          {/* Header del Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                CONTROL <span className="text-red-600">CENTRAL</span>
              </h1>
              <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Linked_Portfolio: <span className="text-white">{CURRENT_SLUG}</span>
              </p>
            </div>

            <div className="flex gap-4">
              <a href="/" target="_blank" className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
                Ir a la Web <ExternalLink size={14} />
              </a>
              {hasChanges && (
                <motion.button 
                  initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                  onClick={saveAllChanges} disabled={isSaving}
                  className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/40"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  Sincronizar Datos
                </motion.button>
              )}
            </div>
          </div>

          {/* Renderizado dinámico de pestañas */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'tech' && <TechManager />}
              {activeTab === 'experience' && <ExperienceManager />}
              {activeTab === 'projects' && (
                <div className="p-20 border-2 border-dashed border-zinc-900 rounded-3xl text-center bg-zinc-900/10">
                  <LayoutDashboard size={48} className="text-zinc-800 mx-auto mb-6" />
                  <p className="text-zinc-600 font-mono text-[11px] uppercase tracking-[0.4em]">
                    [INFO]: Puedes editar proyectos directamente abriendo el modal en la galería principal de la web.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}