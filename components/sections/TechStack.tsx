'use client';

import { motion } from 'framer-motion';
import {
  SiAutodeskmaya, SiBlender, SiUnity,
  SiAdobeaftereffects, SiAdobephotoshop, SiAdobepremierepro,
  SiAseprite, SiKrita,
} from 'react-icons/si';
import { Monitor, Video } from 'lucide-react';

function SubstancePainterIcon({ size = 24 }: { size?: number; className?: string }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="Arial Black, Arial, sans-serif"
      >
        Pt
      </text>
    </svg>
  );
}

function SubstanceDesignerIcon({ size = 24 }: { size?: number; className?: string }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="Arial Black, Arial, sans-serif"
      >
        Ds
      </text>
    </svg>
  );
}

type IconComp = React.ComponentType<{ size?: number; className?: string }>;

function SkillRow({ name, Icon }: { name: string; Icon: IconComp }) {
  return (
    <div className="group flex items-center gap-4 p-4 border border-white/5 bg-zinc-900/20 hover:border-red-600/40 hover:bg-red-950/10 transition-all duration-300 cursor-default">
      <span className="text-zinc-400 group-hover:text-red-500 transition-colors shrink-0">
        <Icon size={22} />
      </span>
      <span className="text-xs font-mono text-zinc-500 group-hover:text-white uppercase tracking-wider font-bold">
        {name}
      </span>
      <div className="ml-auto flex gap-1">
        <div className="w-1 h-3 bg-red-600 opacity-20 group-hover:opacity-100 transition-opacity" />
        <div className="w-1 h-3 bg-red-600 opacity-10 group-hover:opacity-60 transition-opacity" />
      </div>
    </div>
  );
}

export default function TechStack() {
  return (
    <section className="relative w-full py-32 bg-[#050505] border-t border-red-900/20 overflow-hidden">

      <div className="max-w-7xl mx-auto px-10 relative z-10">

        <div className="flex items-center gap-4 mb-20">
          <h2 className="text-red-600 font-mono text-2xl tracking-widest uppercase whitespace-nowrap">
            // SOFTWARE_ARSENAL
          </h2>
          <div className="h-px flex-grow bg-gradient-to-r from-red-900/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-red-900/20 pb-4">
              <span className="text-red-500"><Monitor size={18} /></span>
              <h3 className="text-sm font-black text-white tracking-widest uppercase italic">
                3D and TEXTURING
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <SkillRow name="Blender"             Icon={SiBlender as IconComp}          />
              <SkillRow name="Autodesk Maya"        Icon={SiAutodeskmaya as IconComp}     />
              <SkillRow name="Unity Engine"         Icon={SiUnity as IconComp}            />
              <SkillRow name="Substance Painter"    Icon={SubstancePainterIcon}           />
              <SkillRow name="Substance Designer"   Icon={SubstanceDesignerIcon}          />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-red-900/20 pb-4">
              <span className="text-red-500"><Video size={18} /></span>
              <h3 className="text-sm font-black text-white tracking-widest uppercase italic">
                POST and CREATIVE
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <SkillRow name="After Effects"  Icon={SiAdobeaftereffects as IconComp}  />
              <SkillRow name="Premiere Pro"   Icon={SiAdobepremierepro as IconComp}   />
              <SkillRow name="Photoshop"      Icon={SiAdobephotoshop as IconComp}     />
              <SkillRow name="Aseprite"       Icon={SiAseprite as IconComp}           />
              <SkillRow name="Krita"          Icon={SiKrita as IconComp}              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}