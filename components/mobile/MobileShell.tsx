'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid, User, Instagram } from 'lucide-react';
import MobileHome from './MobileHome';
import MobileProjects from './MobileProjects';
import MobileBio from './MobileBio';
import MobileContact from './MobileContact';


// Definimos las 4 vistas exactas que pediste
type ViewState = 'HOME' | 'PROJECTS' | 'BIO' | 'CONTACT';

export default function MobileShell() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col z-[9999]">
      
      {/* STATUS BAR */}
      <div className="h-12 px-6 flex items-center justify-between bg-black/90 backdrop-blur-md z-50 border-b border-white/5 shrink-0">
         <span className="text-[10px] font-mono text-zinc-500">DANIEL RAYO // APP</span>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-mono text-green-500">ONLINE</span>
         </div>
      </div>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-zinc-950 pb-28">
        <AnimatePresence mode="wait">
          {currentView === 'HOME' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
              <MobileHome onNavigate={(view) => setCurrentView(view)} />
            </motion.div>
          )}
          {currentView === 'PROJECTS' && (
            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
               <MobileProjects />
            </motion.div>
          )}
          {currentView === 'BIO' && (
            <motion.div key="bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
               <MobileBio />
            </motion.div>
          )}
          {currentView === 'CONTACT' && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
               <MobileContact />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DOCK DE NAVEGACIÓN (4 Ítems) */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent">
         <div className="bg-[#111] border border-white/10 rounded-2xl p-1 flex justify-between items-center shadow-2xl h-16">
            
            <NavButton 
              active={currentView === 'HOME'} 
              onClick={() => setCurrentView('HOME')} 
              icon={Home} 
              label="Inicio" 
            />
            <NavButton 
              active={currentView === 'PROJECTS'} 
              onClick={() => setCurrentView('PROJECTS')} 
              icon={Grid} 
              label="Proyectos" 
            />
            <NavButton 
              active={currentView === 'BIO'} 
              onClick={() => setCurrentView('BIO')} 
              icon={User} 
              label="Bio" 
            />
            <NavButton 
              active={currentView === 'CONTACT'} 
              onClick={() => setCurrentView('CONTACT')} 
              icon={Instagram} 
              label="Contacto" 
            />

         </div>
      </div>
    </div>
  );
}

// Subcomponente Botón para limpiar código
function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-xl transition-all duration-300 ${active ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
    >
       <Icon size={20} className={active ? 'text-red-500' : ''} />
       <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}