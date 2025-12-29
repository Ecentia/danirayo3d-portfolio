'use client';

import { motion } from 'framer-motion';

interface RobotMenuProps {
  onAction: (action: string) => void;
  onClose: () => void;
}

// --- ICONOS SVG (Cyberpunk Style) ---
const IconWave = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
  </svg>
);

const IconJump = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const IconYes = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClose = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- COMPONENTE MENÚ ---
export default function RobotMenu({ onAction, onClose }: RobotMenuProps) {
  const menuItems = [
    { label: 'Saludar', action: 'wave', icon: <IconWave /> },
    { label: 'Saltar', action: 'jump', icon: <IconJump /> },
    { label: 'Afirmar', action: 'yes', icon: <IconYes /> },
  ];

  return (
    <div className="relative pointer-events-auto group">
      {/* Línea conectora animada */}
      <div className="absolute top-full left-1/2 w-[1px] h-6 bg-gradient-to-t from-transparent to-cyan-500 -translate-x-1/2 opacity-50"></div>
      
      {/* Contenedor Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="
          min-w-[160px] overflow-hidden
          bg-black/80 backdrop-blur-xl 
          border border-cyan-500/30 rounded-lg 
          shadow-[0_0_30px_rgba(0,255,255,0.15)]
        "
      >
        {/* Encabezado del Menú */}
        <div className="px-3 py-2 bg-cyan-950/30 border-b border-cyan-500/20 flex justify-between items-center">
          <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
            SYS.COMMANDS
          </span>
          {/* Botón Cerrar Mini */}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-cyan-600 hover:text-red-400 transition-colors"
          >
            <IconClose />
          </button>
        </div>

        {/* Lista de Acciones */}
        <div className="p-1 flex flex-col gap-0.5">
          {menuItems.map((item) => (
            <button
              key={item.action}
              onClick={(e) => {
                e.stopPropagation();
                onAction(item.action);
              }}
              className="
                group/btn flex items-center gap-3 px-3 py-2.5 
                text-xs font-bold text-gray-300 
                hover:text-white hover:bg-cyan-500/20 rounded-md 
                transition-all duration-200
                border border-transparent hover:border-cyan-500/30
              "
            >
              <span className="text-cyan-500 group-hover/btn:text-cyan-300 transition-colors">
                {item.icon}
              </span>
              <span className="tracking-wide uppercase">{item.label}</span>
              
              {/* Indicador Hover (Flecha pequeña) */}
              <span className="ml-auto opacity-0 group-hover/btn:opacity-100 text-cyan-400 text-[10px] transition-opacity">
                &gt;
              </span>
            </button>
          ))}
        </div>
        
        {/* Barra de estado inferior decorativa */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      </motion.div>
    </div>
  );
}