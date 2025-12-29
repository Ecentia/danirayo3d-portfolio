'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] py-6 border-t border-white/[0.03] relative overflow-hidden">
      {/* Línea decorativa inferior sutil */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 flex justify-center md:justify-end items-center">
        
        {/* Powered by Ecentia. */}
        <div className="group">
          <Link 
            href="https://ecentia.es" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-2 bg-zinc-900/10 border border-white/[0.05] rounded-full transition-all duration-500 hover:border-red-600/40 hover:bg-zinc-900/30"
          >
            <span className="text-zinc-600 text-[9px] font-mono uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">
              Powered by
            </span>
            <div className="flex items-center gap-0.5">
              <span className="text-white font-black text-sm tracking-tighter group-hover:text-red-600 transition-colors">
                ECENTIA
              </span>
              {/* Punto morado con brillo sutil */}
              <span className="relative flex items-center justify-center">
                <span className="text-[#a855f7] font-black text-sm group-hover:text-red-600 transition-colors">.</span>
                <span className="absolute inset-0 bg-[#a855f7] blur-[4px] opacity-30 group-hover:bg-red-600 transition-colors">.</span>
              </span>
              <ExternalLink size={10} className="text-zinc-700 group-hover:text-red-600 transition-colors ml-2" />
            </div>
          </Link>
        </div>

      </div>
    </footer>
  );
}