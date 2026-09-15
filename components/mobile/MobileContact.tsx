'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

interface ContactLink {
  id: string;
  name: string;
  handle: string;
  url: string;
}

export default function MobileContact() {
  const { isSpanish } = useLanguage();

  const contactLinks: ContactLink[] = [
    {
      id: 'email',
      name: isSpanish ? 'Correo' : 'Email',
      handle: 'drayo3d.contact@gmail.com',
      url: 'mailto:drayo3d.contact@gmail.com',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@d_rayo.3d',
      url: 'https://www.instagram.com/d_rayo.3d/',
    },
    {
      id: 'artstation',
      name: 'ArtStation',
      handle: 'd_rayo3d',
      url: 'https://www.artstation.com/d_rayo3d',
    },
  ];

  return (
    <div className="flex min-h-[80vh] w-full flex-col overflow-x-clip px-5 pb-10 pt-10">
      <div className="mb-8 px-1">
        <h2 className="text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
          {isSpanish ? 'Contacto' : 'Contact'}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/55">
          {isSpanish
            ? '¿Tienes un proyecto en mente? Escríbeme por cualquiera de estos canales.'
            : 'Have a project in mind? Reach me through any of these channels.'}
        </p>
      </div>

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col border-t border-white/[0.08]"
      >
        {contactLinks.map((link) => {
          const isExternal = !link.url.startsWith('mailto:');
          return (
            <motion.li key={link.id} variants={itemVariants} className="border-b border-white/[0.08]">
              <a
                href={link.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group flex items-center justify-between gap-4 px-1 py-5 transition-colors duration-200 active:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="text-lg font-medium tracking-[-0.01em] text-white">{link.name}</p>
                  <p className="truncate text-sm text-white/45">{link.handle}</p>
                </div>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-white/35 transition-transform duration-300 group-active:-translate-y-0.5 group-active:translate-x-0.5"
                />
              </a>
            </motion.li>
          );
        })}
      </motion.ul>

      <p className="mt-auto pt-16 text-center text-sm text-white/35">
        {isSpanish ? 'Disponible para freelance · Sevilla, España' : 'Available for freelance · Seville, Spain'}
      </p>
    </div>
  );
}
