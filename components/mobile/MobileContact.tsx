'use client';

import { Instagram, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function MobileContact() {
  return (
    <div className="p-6 pt-10 h-full flex flex-col pb-28">
       <h2 className="text-4xl font-black text-white uppercase mb-2">Contacto</h2>
       <p className="text-zinc-400 text-sm mb-10">Canales de comunicación oficiales.</p>

       <div className="flex flex-col gap-4">
           
           {/* 1. INSTAGRAM (Principal) */}
           <Link href="https://www.instagram.com/d_rayo.3d/" target="_blank" className="group">
              <div className="bg-gradient-to-r from-purple-600 via-red-600 to-orange-500 p-[1px] rounded-2xl">
                 <div className="bg-black/90 backdrop-blur-xl rounded-[15px] p-6 flex items-center gap-5 group-active:scale-[0.98] transition-transform">
                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                       <Instagram size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white">Instagram</h3>
                       <p className="text-xs text-zinc-400">@d_rayo.3d</p>
                    </div>
                    <ExternalLink className="ml-auto text-zinc-500" size={16} />
                 </div>
              </div>
           </Link>

           {/* 2. ARTSTATION (Logo Corregido) */}
           <Link href="https://www.artstation.com/d_rayo3d" target="_blank" className="group">
              <div className="bg-zinc-800 border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-[#13aff0] hover:text-white transition-all duration-300 group">
                 <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center border border-white/10">
                    {/* SVG Real de ArtStation */}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                       <path d="M12.016 1.155L23.868 21.78H12.001l-5.962-10.224L12.016 1.155zM10.15 11.556L4.172 21.78H.132L10.15 11.556zm10.701 10.224l-3.037-5.188H6.182l3.056 5.188h11.613z"/>
                    </svg>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-white">ArtStation</h3>
                    <p className="text-xs text-zinc-400 group-hover:text-white/80">/d_rayo3d</p>
                 </div>
                 <ExternalLink className="ml-auto text-zinc-500 group-hover:text-white" size={16} />
              </div>
           </Link>

           {/* 3. EMAIL */}
           <Link href="mailto:danielrayo247@gmail.com" className="group">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:border-red-600 transition-colors">
                 <div className="w-12 h-12 bg-zinc-800 text-white rounded-full flex items-center justify-center border border-white/5">
                    <Mail size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Email</h3>
                    <p className="text-xs text-zinc-400">danielrayo247@gmail.com</p>
                 </div>
              </div>
           </Link>

       </div>

       <div className="mt-auto pt-10 text-center opacity-40">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Sevilla, España</p>
       </div>
    </div>
  );
}