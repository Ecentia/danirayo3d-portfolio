'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Home, Grid, Briefcase, Mail, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import MobileHome from './MobileHome';
import MobileProjects from './MobileProjects';
import MobileBio from './MobileBio';
import MobileContact from './MobileContact';

export type ViewState = 'HOME' | 'PROJECTS' | 'CAREER' | 'CONTACT';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

export default function MobileShell() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const { isSpanish } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cada vista empieza arriba. Se hace al terminar la salida para que el salto
  // de scroll no se vea sobre la vista que se está yendo.
  const resetScroll = () => {
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#030303] font-sans text-white selection:bg-red-500/30">

      {/* BARRA SUPERIOR */}
      <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#030303]/85 px-5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setCurrentView('HOME')}
          className="text-[15px] font-medium tracking-[-0.01em] text-white"
          aria-label={isSpanish ? 'Ir al inicio' : 'Go home'}
        >
          Daniel Rayo
        </button>
        <LanguageToggle />
      </header>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden pb-28">
        <AnimatePresence mode="wait" onExitComplete={resetScroll}>
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

      {/* DOCK DE NAVEGACIÓN */}
      <nav className="pointer-events-none fixed bottom-0 left-0 z-[100] w-full bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent px-5 pb-6 pt-10">
        <div className="pointer-events-auto relative mx-auto flex h-[64px] max-w-md items-center justify-between rounded-[1.5rem] border border-white/[0.08] bg-[#0d0d0e]/90 p-1.5 backdrop-blur-xl">
          <NavButton
            active={currentView === 'HOME'}
            onClick={() => setCurrentView('HOME')}
            icon={Home}
            label={isSpanish ? 'Inicio' : 'Home'}
          />
          <NavButton
            active={currentView === 'PROJECTS'}
            onClick={() => setCurrentView('PROJECTS')}
            icon={Grid}
            label={isSpanish ? 'Proyectos' : 'Projects'}
          />
          <NavButton
            active={currentView === 'CAREER'}
            onClick={() => setCurrentView('CAREER')}
            icon={Briefcase}
            label={isSpanish ? 'Experiencia' : 'Career'}
          />
          <NavButton
            active={currentView === 'CONTACT'}
            onClick={() => setCurrentView('CONTACT')}
            icon={Mail}
            label={isSpanish ? 'Contacto' : 'Contact'}
          />
        </div>
      </nav>
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
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative z-10 flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[1.1rem] transition-colors duration-300 ${
        active ? 'text-white' : 'text-white/40 active:text-white/70'
      }`}
    >
      {/* Fondo animado deslizable exclusivo de Framer Motion */}
      {active && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 -z-10 rounded-[1.1rem] bg-white/[0.07]"
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        />
      )}

      <Icon size={19} strokeWidth={active ? 2 : 1.7} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
