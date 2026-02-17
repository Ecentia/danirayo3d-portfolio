'use client';

import { motion } from 'framer-motion';
import { 
  SiAutodeskmaya, SiBlender, SiUnity,
  SiAdobeaftereffects, SiAdobephotoshop, SiAdobepremierepro, 
  SiAseprite, SiKrita
} from 'react-icons/si';
import { Monitor, Video } from 'lucide-react';

// --- ICONOS CUSTOM (SUBSTANCE) ARREGLADOS ---
const SubstanceDesignerIcon = (props: any) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="1.8em" height="1.8em" {...props}>
    <path 
      fillRule="evenodd" 
      d="M90.75,6.17h331a90.75,90.75,0,0,1,90.75,90.75V415.08a90.75,90.75,0,0,1-90.75,90.75h-331A90.75,90.75,0,0,1,0,415.08V96.92A90.75,90.75,0,0,1,90.75,6.17ZM94.15,349.71V131.06a2.5,2.5,0,0,1,2.25-2.74h.16c3.43-.23,8.48-.4,15.12-.52s14.44-.22,23.38-.34,18.45-.17,28.53-.17q41.26,0,68.42,14.09a95.24,95.24,0,0,1,40.74,38.68q13.58,24.58,13.57,56.55a126,126,0,0,1-7,43.83A102.3,102.3,0,0,1,260,313.26a114.64,114.64,0,0,1-27.68,22.87,121.52,121.52,0,0,1-33,13.4,145.18,145.18,0,0,1-34.72,4.3H139q-13.57,0-25.26-.17t-17.54-.52C94.84,353.14,94.15,352,94.15,349.71Zm47.44-180.15V311.89q3.78,0,6.88.17l6.36.34c2.17.12,4.64.18,7.39.18a92.25,92.25,0,0,0,30.6-4.82,62.51,62.51,0,0,0,23.54-14.43,64.82,64.82,0,0,0,15.13-23.73,90,90,0,0,0,5.33-32,80.65,80.65,0,0,0-5.16-30.08,56.9,56.9,0,0,0-14.95-21.66A61.33,61.33,0,0,0,193.33,173a102.07,102.07,0,0,0-29.74-4.12c-4.58,0-8.42.05-11.51.17s-6.59.29-10.49.51Zm279.84,57.44A80.53,80.53,0,0,0,401,219.76,108.56,108.56,0,0,0,377.08,217a44.93,44.93,0,0,0-12.9,1.55,11.62,11.62,0,0,0-6.7,4.3,10.8,10.8,0,0,0-1.72,5.84,9.19,9.19,0,0,0,2.06,5.5,23.59,23.59,0,0,0,7.22,5.68,144.12,144.12,0,0,0,15.13,7A150.13,150.13,0,0,1,413,262.56a49.88,49.88,0,0,1,16.85,17.7,47.26,47.26,0,0,1,5,22,49.39,49.39,0,0,1-8.25,28.37,54.32,54.32,0,0,1-23.89,19.08Q387,356.58,364,356.58A139.59,139.59,0,0,1,335,353.83a83,83,0,0,1-20.8-6.87,4.46,4.46,0,0,1-2.4-4.13V305.7a2,2,0,0,1,.86-1.89,1.68,1.68,0,0,1,1.89.17A85.46,85.46,0,0,0,340,314.47,108.91,108.91,0,0,0,365,317.73q12,0,17.71-3.09a9.72,9.72,0,0,0,5.67-8.94q0-4.45-5.15-8.59t-21-10a126.39,126.39,0,0,1-30.42-15.47,52.63,52.63,0,0,1-16.16-18.05,47.37,47.37,0,0,1-5-21.83A49.3,49.3,0,0,1,318,206a52.41,52.41,0,0,1,22.34-19.59q15.12-7.56,37.82-7.56a166.33,166.33,0,0,1,26.47,1.89,64.64,64.64,0,0,1,17.88,5,3.13,3.13,0,0,1,2.06,1.89,9.38,9.38,0,0,1,.34,2.58v34.72a2.32,2.32,0,0,1-1,2.07A2.26,2.26,0,0,1,421.43,227Z"
    />
  </svg>
);

const SubstancePainterIcon = (props: any) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="1.8em" height="1.8em" {...props}>
    <path 
      fillRule="evenodd" 
      d="M90.75,0h331a90.75,90.75,0,0,1,90.75,90.75V408.91a90.75,90.75,0,0,1-90.75,90.75h-331A90.75,90.75,0,0,1,0,408.91V90.75A90.75,90.75,0,0,1,90.75,0ZM110.85,350.39V130.71c0-1.6.68-2.4,2.06-2.4q5.49,0,13.06-.17t16.33-.35l18.57-.34q9.8-.18,19.42-.18,26.13,0,44,6.54A76.18,76.18,0,0,1,253,151.34a67.28,67.28,0,0,1,15.64,24.24,80.35,80.35,0,0,1,4.82,27.67q0,27.51-12.72,45.38a72,72,0,0,1-34.38,26,137.05,137.05,0,0,1-48.13,8.08q-7.57,0-10.66-.18c-2.06-.11-5.16-.17-9.28-.17v67.73a2.74,2.74,0,0,1-2.32,3.09,2.49,2.49,0,0,1-.77,0H113.25C111.65,353.14,110.85,352.23,110.85,350.39Zm47.44-180.83v71.17q4.46.35,8.25.34h11.34a81.19,81.19,0,0,0,24.58-3.44A37.11,37.11,0,0,0,220,226.29q6.7-7.9,6.7-22a34.81,34.81,0,0,0-5-18.9,32.14,32.14,0,0,0-15-12.21,63.8,63.8,0,0,0-25.09-4.29q-8.25,0-14.61.17t-8.77.51ZM401,319.11V347.3q0,3.78-2.75,4.47a122.82,122.82,0,0,1-13.75,3.44A88.75,88.75,0,0,1,368,356.58q-22.35,0-35.06-11.69t-12.72-37.47V222.16H299.92c-1.83,0-2.75-1-2.75-3.09V185c0-1.83,1-2.75,3.1-2.75h20.28q.34-5.84.86-13.58c.35-5.15.8-10.31,1.38-15.47s1.08-9.34,1.54-12.54a6.09,6.09,0,0,1,1-1.89,3.74,3.74,0,0,1,1.72-1.21L368,132.44a2.87,2.87,0,0,1,1.89.09c.46.23.52.83.52,2q-.69,7.91-1,21.49t-.69,26.29h32c1.38,0,2.07.92,2.07,2.75v34.73a2.12,2.12,0,0,1-1.72,2.4H368.34v73.57q0,11.7,4,16.68t14.61,5c2.06,0,4-.05,5.85-.17s3.66-.29,5.5-.52a2.21,2.21,0,0,1,1.89.17A2.44,2.44,0,0,1,401,319.11Z"
    />
  </svg>
);

// --- CATEGORÍAS ORGANIZADAS ---
const TECH_CATEGORIES = [
  {
    title: "3D & TEXTURING",
    icon: <Monitor size={18} />,
    skills: [
      { name: "Blender", icon: SiBlender },
      { name: "Autodesk Maya", icon: SiAutodeskmaya },
      { name: "Unity Engine", icon: SiUnity },
      { name: "Substance Painter", icon: SubstancePainterIcon },
      { name: "Substance Designer", icon: SubstanceDesignerIcon },
    ]
  },
  {
    title: "POST & CREATIVE",
    icon: <Video size={18} />,
    skills: [
      { name: "After Effects", icon: SiAdobeaftereffects },
      { name: "Premiere Pro", icon: SiAdobepremierepro },
      { name: "Photoshop", icon: SiAdobephotoshop },
      { name: "Aseprite", icon: SiAseprite },
      { name: "Krita", icon: SiKrita },
    ]
  }
];

export default function TechStack() {
  return (
    // CAMBIO 1: bg-black -> bg-[#09090b] (Obsidiana)
    <section className="relative w-full py-32 bg-[#09090b] overflow-hidden border-t border-red-900/20">
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        
        {/* Header estilo Rayo */}
        <div className="flex items-center gap-4 mb-20">
          <h2 className="text-red-600 font-mono text-2xl tracking-[0.3em] uppercase">
            // SOFTWARE_ARSENAL
          </h2>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-red-900/50 to-transparent"></div>
        </div>

        {/* Grid de 2 columnas para que quede centrado y robusto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {TECH_CATEGORIES.map((cat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 border-b border-red-900/20 pb-4">
                <span className="text-red-500">{cat.icon}</span>
                <h3 className="text-sm font-black text-white tracking-widest uppercase italic">
                  {cat.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {cat.skills.map((skill, sIdx) => (
                  <div 
                    key={sIdx}
                    // CAMBIO 2: Glass Effect
                    // Antes: bg-zinc-900/20 
                    // Ahora: bg-white/5 backdrop-blur-sm
                    className="group flex items-center gap-4 p-4 border border-white/5 bg-white/5 backdrop-blur-sm hover:border-red-600/50 hover:bg-red-950/10 transition-all duration-500 cursor-default rounded-sm"
                  >
                    {/* Icono: Zinc por defecto, Rojo al hover */}
                    <skill.icon 
                      size={24} 
                      className="text-zinc-400 group-hover:text-red-500 transition-colors duration-300" 
                    />
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-white uppercase tracking-wider font-bold">
                      {skill.name}
                    </span>
                    
                    {/* Indicador de carga decorativo */}
                    <div className="ml-auto flex gap-1">
                      <div className="w-1 h-3 bg-red-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-1 h-3 bg-red-600 opacity-10 group-hover:opacity-60 transition-opacity"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grid de fondo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-50"></div>
    </section>
  );
}