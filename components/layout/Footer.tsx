'use client';

import Link from 'next/link';
import { ExternalLink, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#030303] py-8 border-t border-white/[0.02] relative overflow-hidden">
      
      {/* --- FONDO TECH --- */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute inset-0 [background-image:radial-gradient(ellipse_at_bottom,rgba(220,38,38,0.15),transparent_50%)]" />
         <div className="absolute inset-0 [background-image:linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* --- LÍNEA ESCÁNER LÁSER --- */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900/30 to-transparent">
          <motion.div 
              className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* --- IZQUIERDA: STATUS & COPYRIGHT --- */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-zinc-500">
            <div className="flex items-center gap-2" title="All systems operational">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">System_Online</span>
            </div>
            <span className="text-zinc-800 hidden md:inline">|</span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600">
                {currentYear} © DANIEL RAYO
            </span>
        </div>

        {/* --- DERECHA: POWERED BY ECENTIA --- */}
        <div className="group">
          <Link 
            href="https://ecentia.es" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative flex items-center gap-3 px-6 py-2.5 bg-black/40 backdrop-blur-md border border-white/[0.05] rounded-full transition-all duration-500 hover:border-red-500/40 hover:bg-zinc-900/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] overflow-hidden"
          >
            {/* Brillo de barrido (Glow Sweep) en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            {/* Icono decorativo */}
            <Cpu size={14} className="text-zinc-600 group-hover:text-red-500 transition-colors duration-300" />

            <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors duration-300">
              Developed by
            </span>
            
            <div className="flex items-center gap-0.5 relative">
              <span className="text-white font-black text-sm tracking-tighter group-hover:text-red-500 transition-colors duration-300">
                ECENTIA
              </span>
              
              {/* Punto Ecentia (Mantiene el morado por defecto, cambia a rojo tech en hover) */}
              <span className="relative flex items-center justify-center">
                <span className="text-[#a855f7] font-black text-sm group-hover:text-red-500 transition-colors duration-300">.</span>
                <span className="absolute inset-0 bg-[#a855f7] blur-[4px] opacity-40 group-hover:bg-red-500 transition-colors duration-300">.</span>
              </span>
            </div>
            
            <ExternalLink size={12} className="text-zinc-600 group-hover:text-red-500 transition-all duration-300 ml-1 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" />
          </Link>
        </div>

      </div>
    </footer>
  );
}