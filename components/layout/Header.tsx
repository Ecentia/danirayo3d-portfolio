'use client';

import { useState } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring,
  useMotionTemplate
} from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/context/AdminContext';
import { Settings, Menu, X, ArrowRight, Zap } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Proyectos', href: '#proyectos' },
  { name: 'Trayectoria', href: '#trayectoria' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const { scrollY } = useScroll();

  // --- FÍSICA DE FLUIDEZ EXTREMA ---
  // Mapeamos el scroll (0px a 100px) a valores de estilo directos
  const scrollRange = [0, 100];

  // 1. Ancho: De ocupar toda la pantalla a ser una isla central
  const rawWidth = useTransform(scrollY, scrollRange, ['100%', '60%']); 
  const width = useSpring(rawWidth, { stiffness: 400, damping: 40 }); // Amortiguación suave

  // 2. Posición Y: Se separa del techo un poco
  const rawY = useTransform(scrollY, scrollRange, [0, 20]);
  const y = useSpring(rawY, { stiffness: 400, damping: 40 });

  // 3. Fondo: De transparente a cristal oscuro casi sólido
  const bgOpacity = useTransform(scrollY, scrollRange, [0, 0.85]);
  const backgroundColor = useMotionTemplate`rgba(5, 5, 5, ${bgOpacity})`;
  
  // 4. Blur: El desenfoque aumenta gradualmente
  const blurValue = useTransform(scrollY, scrollRange, [0, 16]);
  const backdropFilter = useMotionTemplate`blur(${blurValue}px)`;

  // 5. Bordes: Se redondean y aparece un borde sutil
  const borderRadius = useTransform(scrollY, scrollRange, [0, 999]); // 999 para pill total
  const borderColor = useTransform(scrollY, scrollRange, ['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)']);

  // 6. Padding: Se ajusta para compactar el contenido
  const paddingY = useTransform(scrollY, scrollRange, ['1.5rem', '0.75rem']); // py-6 a py-3

  return (
    <>
      <motion.header
        style={{
          width,
          y,
          backgroundColor,
          backdropFilter,
          borderRadius,
          borderColor,
          paddingTop: paddingY,
          paddingBottom: paddingY,
        }}
        className="fixed top-0 left-0 right-0 z-[100] mx-auto border border-transparent min-w-[340px] max-w-[1400px] overflow-hidden"
      >
        <div className="w-full h-full px-6 md:px-8 flex items-center justify-between">
          
          {/* --- 1. LOGO: VISIBILIDAD INTELIGENTE --- */}
          <Link href="/" className="group flex items-center gap-3 relative z-20 outline-none">
            <div className="relative w-8 h-8 flex items-center justify-center">
               <div className="absolute inset-0 bg-red-600/40 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <Image 
                  src="/favicon.ico" 
                  alt="Logo" 
                  width={28} 
                  height={28} 
                  className="relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                />
            </div>
            {/* Ocultamos el texto en pantallas muy pequeñas o al hacer scroll muy agresivo si se desea, 
                pero aquí lo mantenemos elegante */}
            <motion.div className="flex flex-col whitespace-nowrap">
              <span className="text-white font-black tracking-tight text-sm leading-none">
                DANIEL <span className="text-red-600">RAYO</span>
              </span>
            </motion.div>
          </Link>

          {/* --- 2. NAVEGACIÓN CENTRAL: FLOTANTE --- */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.name} className="relative">
                  <Link
                    href={link.href}
                    onMouseEnter={() => setHoveredTab(link.name)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`relative z-10 block px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                      hoveredTab === link.name ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                  {hoveredTab === link.name && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-white/5 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* --- 3. BOTÓN HYPER-ACTION --- */}
          <div className="flex items-center gap-4 relative z-20">
            {isAdmin && (
              <Link href="/admin" className="text-zinc-600 hover:text-white transition-colors">
                <Settings size={16} />
              </Link>
            )}

            <Link href="#contacto" className="hidden sm:block">
              <motion.button 
                whileHover="hover"
                initial="initial"
                className="group relative h-9 px-6 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden shadow-lg flex items-center justify-center"
              >
                {/* Capa Roja de Fondo (Barrido) */}
                <motion.div 
                  variants={{ initial: { x: '-110%' }, hover: { x: '0%' } }}
                  transition={{ type: "tween", ease: [0.19, 1, 0.22, 1], duration: 0.5 }}
                  className="absolute inset-0 bg-red-600"
                />
                
                <div className="relative z-10 flex items-center overflow-hidden h-full">
                  {/* Texto 1: HABLEMOS */}
                  <motion.span 
                    variants={{ initial: { y: 0 }, hover: { y: '-150%' } }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="block text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  >
                    Hablemos
                  </motion.span>
                  
                  {/* Texto 2: CONTACTAR + ICONO */}
                  <motion.div
                    variants={{ initial: { y: '150%' }, hover: { y: 0 } }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center gap-2 w-full"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.0em] text-white">Contactar</span>
             
                  </motion.div>
                </div>
              </motion.button>
            </Link>

            {/* Menú Móvil Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white hover:text-red-600 transition-colors"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* --- 4. MENÚ MÓVIL: SISTEMA INMERSIVO --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">// NAVEGACIÓN_SISTEMA</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-8">
              {[...NAV_LINKS, { name: 'Estudio', href: '#sobre-mi' }].map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1, ease: "easeOut" }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between group border-b border-white/5 pb-4"
                  >
                    <span className="text-4xl md:text-6xl font-black text-white group-hover:text-red-600 transition-colors uppercase tracking-tighter">
                      {link.name}
                    </span>
                    <ArrowRight className="text-zinc-700 group-hover:text-white -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto flex justify-between items-end">
               <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="opacity-20 grayscale" />
               <div className="text-right text-[10px] font-mono text-zinc-500">
                  <p>MADRID — ES</p>
                  <p>{new Date().getFullYear()} © DANIEL RAYO</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}