'use client';

import Link from 'next/link';
import { ExternalLink, Mail } from 'lucide-react';
import { SiArtstation, SiInstagram } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="w-full bg-[#020202] border-t border-white/5">

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <div className="py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-2xl font-black text-white tracking-tighter">
                DANIEL <span className="text-red-600">RAYO</span>
              </p>
              <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mt-1">
                3D Artist and Developer
              </p>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              Creando experiencias visuales desde Sevilla, España.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-green-600 uppercase tracking-widest">
                Disponible
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
              Navegacion
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="#proyectos"
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Proyectos
              </Link>
              <Link
                href="#trayectoria"
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Trayectoria
              </Link>
              <Link
                href="#contacto"
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
              Contacto
            </p>
            
              href="mailto:danielrayo247@gmail.com"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <Mail size={14} />
              danielrayo247@gmail.com
            </a>
            <div className="flex gap-3 mt-1">
              
                href="https://www.artstation.com/d_rayo3d"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all"
              >
                <SiArtstation size={16} />
              </a>
              
                href="https://www.instagram.com/d_rayo.3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all"
              >
                <SiInstagram size={16} />
              </a>
            </div>
          </div>

        </div>

        <div className="h-px bg-white/5" />

        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-zinc-700">
            2025 DANIEL RAYO — TODOS LOS DERECHOS RESERVADOS
          </p>
          <Link
            href="https://ecentia.es"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-mono text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            <span>POWERED BY</span>
            <span className="text-white font-black ml-1">ECENTIA</span>
            <span className="text-purple-500 font-black">.</span>
            <ExternalLink size={9} className="ml-1" />
          </Link>
        </div>

      </div>
    </footer>
  );
}