'use client';

import Experience from '@/components/sections/Experience';
import { User } from 'lucide-react';

export default function MobileBio() {
  return (
    <div className="pt-6 pb-24">
      <div className="px-6 mb-2">
         <h2 className="text-3xl font-black text-white uppercase flex items-center gap-3">
           <User className="text-red-600" /> Trayectoria
         </h2>
         <p className="text-xs text-zinc-500 font-mono mt-1">TIMELINE_LOG // EXPERIENCE</p>
      </div>

      {/* Componente de Trayectoria Original */}
      <div className="relative [&>div]:py-4"> 
         <Experience />
      </div>
    </div>
  );
}