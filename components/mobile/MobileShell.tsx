'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Home, Grid, Briefcase, Mail, LucideIcon } from 'lucide-react'; // Importamos LucideIcon y Briefcase
import MobileHome from './MobileHome';
import MobileProjects from './MobileProjects';
import MobileBio from './MobileBio';
import MobileContact from './MobileContact';

// Cambiamos 'BIO' a 'CAREER'
type ViewState = 'HOME' | 'PROJECTS' | 'CAREER' | 'CONTACT';

export default function MobileShell() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  // Asignamos el tipo Variants de Framer Motion para solucionar el error 2322
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: 'spring', stiffness: 100, damping: 20 } 
    },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="fixed inset-0 bg-[#030303] text-white overflow-hidden flex flex-col z-[9999] selection:bg-red-500/30">
      
      {/* STATUS BAR (Sleek & Minimal) */}
      <div className="h-14 px-6 flex items-center justify-between bg-[#030303]/70 backdrop-blur-2xl z-50 border-b border-white/5 shrink-0 shadow-sm">
         <span className="text-[10px] font-black tracking-[0.25em] text-zinc-400">
           DANIEL RAYO 
         </span>
         <div className="flex items-center gap-2 px-2.5 py-1 text-[10px] font-black tracking-[0.25em] text-zinc-400">
            <span className="text-red-500/70">PORTFOLIO</span>
         </div>
      </div>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden pb-28">
        <AnimatePresence mode="wait">
          {currentView === 'HOME' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-full">
              <MobileHome onNavigate={(view) => setCurrentView(view)} />
            </motion.div>
          )}
          {currentView === 'PROJECTS' && (
            <motion.div key="projects" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-full">
               <MobileProjects />
            </motion.div>
          )}
          {currentView === 'CAREER' && (
            <motion.div key="career" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-full">
               <MobileBio /> {/* Mantiene el componente MobileBio por debajo pero ahora es la sección Career */}
            </motion.div>
          )}
          {currentView === 'CONTACT' && (
            <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-full">
               <MobileContact />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DOCK DE NAVEGACIÓN (Floating Glassmorphism Pill) */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-6 pt-10 z-[100] bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent pointer-events-none">
         <div className="max-w-md mx-auto bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-1.5 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] h-[72px] pointer-events-auto relative">
            
            <NavButton 
              active={currentView === 'HOME'} 
              onClick={() => setCurrentView('HOME')} 
              icon={Home} 
              label="Home" 
            />
            <NavButton 
              active={currentView === 'PROJECTS'} 
              onClick={() => setCurrentView('PROJECTS')} 
              icon={Grid} 
              label="Projects" 
            />
            {/* Actualizado a Career con el nuevo icono */}
            <NavButton 
              active={currentView === 'CAREER'} 
              onClick={() => setCurrentView('CAREER')} 
              icon={Briefcase} 
              label="Career" 
            />
            <NavButton 
              active={currentView === 'CONTACT'} 
              onClick={() => setCurrentView('CONTACT')} 
              icon={Mail} 
              label="Contact" 
            />

         </div>
      </div>
    </div>
  );
}

// --- TIPADO Y COMPONENTE NAV BUTTON ---
interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon; // Soluciona los errores de tipo 'never' para 'size' y 'strokeWidth'
  label: string;
}

function NavButton({ active, onClick, icon: Icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center gap-1.5 h-full rounded-[1.25rem] transition-all duration-500 z-10 ${
        active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
       {/* Fondo animado deslizable exclusivo de Framer Motion */}
       {active && (
         <motion.div
           layoutId="active-nav-pill"
           className="absolute inset-0 bg-white/10 border border-white/5 rounded-[1.25rem] -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
           transition={{ type: "spring", stiffness: 400, damping: 30 }}
         />
       )}
       
       {/* Icono con brillo activo */}
       <Icon 
         size={22} 
         strokeWidth={active ? 2.5 : 2} 
         className={`transition-all duration-500 ${active ? 'text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] scale-110' : 'scale-100'}`} 
       />
       <span className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-500 ${active ? 'opacity-100' : 'opacity-70'}`}>
         {label}
       </span>
    </button>
  );
}