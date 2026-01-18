'use client';

import Link from 'next/link';
import { ExternalLink, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.03] pt-16 pb-8 relative overflow-hidden">
      {/* Línea de luz superior sutil */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          
          {/* IZQUIERDA: BRANDING (DANIEL RAYO) */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="group flex items-center gap-3">
              <span className="text-white font-black text-2xl tracking-tighter transition-colors group-hover:text-red-600">
                DANIEL <span className="text-red-600 group-hover:text-white transition-colors">RAYO</span>
              </span>
            </Link>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em]">
              3D Artist & Game Developer
            </p>
          </div>

          {/* DERECHA: POWERED BY ECENTIA */}
          <div className="flex items-center gap-6">
            <div className="group">
              <Link 
                href="https://ecentia.es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-2.5 bg-zinc-900/20 border border-white/[0.05] rounded-full transition-all duration-500 hover:border-red-600/40 hover:bg-zinc-900/50"
              >
                <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
                  Powered by
                </span>
                <div className="flex items-center gap-0.5">
                  <span className="text-white font-black text-sm tracking-tighter group-hover:text-red-600 transition-colors">
                    ECENTIA
                  </span>
                  <span className="relative flex items-center justify-center">
                    <span className="text-red-600 font-black text-sm">.</span>
                    <span className="absolute inset-0 bg-red-600 blur-[4px] opacity-40">.</span>
                  </span>
                  <ExternalLink size={10} className="text-zinc-700 group-hover:text-red-600 transition-colors ml-2" />
                </div>
              </Link>
            </div>

            {/* BOTÓN VOLVER ARRIBA */}
            <button 
              onClick={scrollToTop}
              className="w-10 h-10 flex items-center justify-center border border-white/5 rounded-full text-zinc-600 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all group"
              title="Volver arriba"
            >
              <ArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* LÍNEA DE COPYRIGHT */}
        <div className="pt-8 border-t border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">
            © {currentYear} TODOS LOS DERECHOS RESERVADOS
          </div>
          <div className="flex gap-6 text-zinc-700 text-[10px] font-mono uppercase tracking-widest">
            <span>SEVILLA, ES</span>
            <span className="text-zinc-800">|</span>
          </div>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full pointer-events-none"></div>
    </footer>
  );
}