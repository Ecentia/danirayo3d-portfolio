'use client';

import { motion } from 'framer-motion';
import { 
  SiNextdotjs, SiReact, SiSupabase, SiTailwindcss, 
  SiUnrealengine, SiAutodeskmaya, SiBlender,  SiThreedotjs 
} from 'react-icons/si';
import { Cpu, Terminal, Zap, Network } from 'lucide-react';

const TECH_CATEGORIES = [
  {
    title: "3D & GAME DEV",
    icon: <Zap size={18} />,
    skills: [
      { name: "Unreal Engine 5", icon: SiUnrealengine },
      { name: "Autodesk Maya", icon: SiAutodeskmaya },
      { name: "Blender", icon: SiBlender },
    ]
  },
  {
    title: "DEVELOPMENT",
    icon: <Terminal size={18} />,
    skills: [
      { name: "Next.js", icon: SiNextdotjs },
      { name: "Three.js", icon: SiThreedotjs },
      { name: "React Fiber", icon: SiReact },
      { name: "Supabase", icon: SiSupabase },
    ]
  },
  {
    title: "INFRASTRUCTURE",
    icon: <Network size={18} />,
    skills: [
      { name: "SMR Systems", icon: Cpu },
      { name: "Networks", icon: Network },
    ]
  }
];

export default function TechStack() {
  return (
    <section className="relative w-full py-32 bg-black overflow-hidden border-t border-rayo-red/10">
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        
        {/* Header estilo Rayo */}
        <h2 className="text-rayo-red font-mono mb-20 text-2xl tracking-[0.5em] uppercase">
          // TECH_STACK_OVERRIDE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {TECH_CATEGORIES.map((cat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 border-b border-rayo-red/20 pb-4">
                <span className="text-rayo-red">{cat.icon}</span>
                <h3 className="text-sm font-black text-white tracking-widest uppercase italic">
                  {cat.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {cat.skills.map((skill, sIdx) => (
                  <div 
                    key={sIdx}
                    className="group flex items-center gap-4 p-4 border border-white/5 bg-rayo-dark/50 hover:border-rayo-red transition-all duration-500"
                  >
                    <skill.icon 
                      size={24} 
                      className="text-white group-hover:text-rayo-red transition-colors" 
                    />
                    <span className="text-xs font-mono text-gray-400 group-hover:text-white uppercase tracking-tighter">
                      {skill.name}
                    </span>
                    
                    {/* Indicador de carga decorativo */}
                    <div className="ml-auto flex gap-1">
                      <div className="w-1 h-3 bg-rayo-red opacity-20 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-1 h-3 bg-rayo-red opacity-10 group-hover:opacity-60 transition-opacity"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grid de fondo sutil del globals.css */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-20"></div>
    </section>
  );
}