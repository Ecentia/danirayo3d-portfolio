'use client';

import { motion, Variants } from 'framer-motion';
import { Instagram, Mail, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // <-- Importamos el componente Image de Next.js

export default function MobileContact() {
  
  // --- VARIANTES FRAMER MOTION ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  const contactLinks = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@d_rayo.3d',
      url: 'https://www.instagram.com/d_rayo.3d/',
      icon: <Instagram size={22} />,
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      glow: 'group-hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] group-active:shadow-[0_0_30px_rgba(217,70,239,0.3)]'
    },
    {
      id: 'artstation',
      name: 'ArtStation',
      handle: '/d_rayo3d',
      url: 'https://www.artstation.com/d_rayo3d',
      // --- LOGO ARTSTATION DESDE TU ARCHIVO .WEBP ---
      icon: (
        <div className="relative w-[22px] h-[22px]">
          <Image 
            src="/artstation-logo.webp" 
            alt="ArtStation" 
            fill 
            className="object-contain drop-shadow-sm"
          />
        </div>
      ),
      gradient: 'from-[#13aff0] to-[#0d7eaebd]',
      glow: 'group-hover:shadow-[0_0_30px_rgba(19,175,240,0.3)] group-active:shadow-[0_0_30px_rgba(19,175,240,0.3)]'
    },
    {
      id: 'email',
      name: 'Email',
      handle: 'drayo3d.contact@gmail.com',
      url: 'mailto:drayo3d.contact@gmail.com',
      icon: <Mail size={22} />,
      gradient: 'from-red-500 to-red-800',
      glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] group-active:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
    }
  ];

  return (
    <div className="pt-10 pb-10 w-full overflow-x-clip px-5 flex flex-col min-h-[80vh]">
      
      {/* HEADER */}
      <div className="flex flex-col mb-10 px-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            Get In <span className="text-red-500">Touch</span>
          </h2>
          <span className="text-[9px] font-bold tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
             3 CHANNELS
          </span>
        </div>
        <p className="text-xs text-zinc-500 font-mono mt-1 flex items-center gap-2">
           <Sparkles size={12} className="text-red-500/70" />
           OFFICIAL COMMS LINKS
        </p>
      </div>

      {/* LISTA DE ENLACES */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5 relative z-10"
      >
         {contactLinks.map((link) => (
            <motion.div key={link.id} variants={itemVariants}>
              <Link href={link.url} target="_blank" className="block group outline-none">
                 
                 <div className={`relative bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 flex items-center gap-5 transition-all duration-300 active:scale-[0.96] overflow-hidden ${link.glow}`}>
                    
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 group-active:opacity-20 transition-opacity duration-500 bg-gradient-to-r pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                    <div className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b ${link.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

                    <div className="relative w-14 h-14 bg-[#050505] rounded-full flex items-center justify-center border border-white/5 shadow-inner shrink-0 z-10 group-hover:scale-110 transition-transform duration-500">
                       <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-20 rounded-full blur-md`} />
                       <div className="text-white relative z-10 flex items-center justify-center">
                         {link.icon}
                       </div>
                    </div>

                    <div className="flex-1 min-w-0 z-10">
                       <h3 className="text-lg font-bold text-white tracking-tight">{link.name}</h3>
                       <p className="text-[11px] text-zinc-400 font-mono truncate">{link.handle}</p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 z-10 group-hover:bg-white/10 transition-colors">
                       <ExternalLink size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                    </div>

                 </div>

              </Link>
            </motion.div>
         ))}
      </motion.div>

      {/* FOOTER */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-auto pt-16 pb-8 flex flex-col items-center justify-center gap-3"
      >
         <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Available for Freelance</span>
         </div>
         
         <div className="flex items-center gap-1.5 text-zinc-600">
            <MapPin size={12} />
            <p className="text-[10px] font-mono uppercase tracking-widest">Seville, Spain</p>
         </div>
      </motion.div>

    </div>
  );
}