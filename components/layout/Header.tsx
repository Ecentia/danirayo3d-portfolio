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
import { useUi } from '@/context/UiContext';
import { Settings, Menu, X, ArrowRight } from 'lucide-react';

// Añadimos el 'id' para el efecto visual de los enlaces
const NAV_LINKS = [
  { name: 'Projects', id: '01', href: '#proyectos' },
  { name: 'Career', id: '02', href: '#trayectoria' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const { isProjectModalOpen } = useUi(); 
  const { scrollY } = useScroll();

  // --- FÍSICA DE FLUIDEZ ESTILIZADA ---
  const scrollRange = [0, 120];

  // 1. Ancho: De 100% a un panel ESTIRADO (950px). 
  const rawWidth = useTransform(scrollY, scrollRange, ['100%', '950px']); 
  const width = useSpring(rawWidth, { stiffness: 400, damping: 40 });

  // 2. Posición Y: Baja suavemente para flotar
  const rawY = useTransform(scrollY, scrollRange, [0, 24]);
  const y = useSpring(rawY, { stiffness: 400, damping: 40 });

  // 3. Fondo: De totalmente transparente a un cristal ahumado oscuro
  const bgOpacity = useTransform(scrollY, scrollRange, [0, 0.8]);
  const backgroundColor = useMotionTemplate`rgba(5, 5, 7, ${bgOpacity})`;
  
  // 4. Desenfoque (Glassmorphism)
  const blurValue = useTransform(scrollY, scrollRange, [0, 20]);
  const backdropFilter = useMotionTemplate`blur(${blurValue}px)`;

  // 5. Bordes: Se redondean progresivamente y aparece un borde sutil
  const borderRadius = useTransform(scrollY, scrollRange, [0, 999]); 
  const borderColor = useTransform(scrollY, scrollRange, ['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)']);

  // 6. Padding: Se comprime ligeramente al hacer scroll
  const paddingY = useTransform(scrollY, scrollRange, ['1.5rem', '0.75rem']); 

  // 7. Sombra proyectada sutil
  const shadowOpacity = useTransform(scrollY, scrollRange, [0, 0.15]);
  const boxShadow = useMotionTemplate`0 10px 40px -10px rgba(0, 0, 0, ${shadowOpacity})`;

  return (
    <>
      {/* WRAPPER GLOBAL */}
      <div
        className={`fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-all duration-[600ms] ease-out ${
          isProjectModalOpen ? 'opacity-0 -translate-y-12 invisible' : 'opacity-100 translate-y-0 visible'
        }`}
      >
        <motion.header
          style={{ width, y, backgroundColor, backdropFilter, borderRadius, borderColor, boxShadow, paddingTop: paddingY, paddingBottom: paddingY }}
          // El min-w de 950px asegura que esté bien estirado en PC y no se rompa visualmente
          className="pointer-events-auto mx-auto border border-transparent md:min-w-[950px] max-w-[1400px] overflow-hidden"
        >
          <div className="w-full h-full px-6 md:px-8 flex items-center justify-between whitespace-nowrap">
            
            {/* --- 1. LOGO: EFECTOS CYBERPUNK RESTAURADOS --- */}
            <Link href="/" className="group flex items-center gap-4 relative z-20 outline-none">
              <div className="relative w-10 h-10 flex items-center justify-center">
                 {/* Anillos rotatorios */}
                 <div className="absolute inset-0 border-[2px] border-t-red-600 border-r-transparent border-b-transparent border-l-red-900/50 rounded-full animate-[spin_3s_linear_infinite]" />
                 <div className="absolute inset-1 border-[1px] border-b-red-500 border-l-transparent border-t-transparent border-r-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                 
                 {/* Resplandor del núcleo */}
                 <div className="absolute inset-2 bg-red-600 blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                 
                 {/* Logo SIN filtro grayscale */}
                 <Image 
                    src="/favicon.ico" 
                    alt="Logo" 
                    width={24} 
                    height={24} 
                    className="relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                  />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-white font-black tracking-tighter text-base leading-none flex items-center gap-1">
                  DANIEL <span className="text-red-500">RAYO</span>
                </span>

              </div>
            </Link>

            {/* --- 2. NAVEGACIÓN CENTRAL: EFECTO BRACKETS --- */}
            <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ul className="flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                  <li key={link.name} className="relative group/link">
                    <Link
                      href={link.href}
                      className="relative z-10 flex items-center gap-2 px-2 py-2"
                    >
                      {/* Corchetes [ ] */}
                      <span className="text-zinc-700 font-mono text-sm group-hover/link:text-red-500 group-hover/link:-translate-x-1.5 transition-all duration-300">
                        [
                      </span>
                      
                      <div className="flex flex-col items-center justify-center relative">
                         <span className="text-[12px] font-black tracking-[0.2em] uppercase text-zinc-400 group-hover/link:text-white transition-colors duration-300">
                           {link.name}
                         </span>
                         {/* Texto MOD.01 flotante inferior */}
                         <span className="text-[8px] font-mono text-red-500/0 group-hover/link:text-red-500/80 transition-colors duration-300 uppercase absolute -bottom-3">
                           MOD.{link.id}
                         </span>
                      </div>

                      <span className="text-zinc-700 font-mono text-sm group-hover/link:text-red-500 group-hover/link:translate-x-1.5 transition-all duration-300">
                        ]
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* --- 3. BOTÓN HYPER-ACTION (ANIMACIÓN ORIGINAL RESTAURADA) --- */}
            <div className="flex items-center gap-4 relative z-20">
              {isAdmin && (
                <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                  <Settings size={14} />
                </Link>
              )}

              <Link href="#contacto" className="hidden sm:block">
                <motion.button 
                  whileHover="hover"
                  initial="initial"
                  className="group relative h-10 px-6 bg-zinc-950/80 border border-zinc-800 rounded-full overflow-hidden shadow-lg flex items-center justify-center backdrop-blur-sm"
                >
                  {/* Capa Roja de Fondo (Barrido) */}
                  <motion.div 
                    variants={{ initial: { x: '-110%' }, hover: { x: '0%' } }}
                    transition={{ type: "tween", ease: [0.19, 1, 0.22, 1], duration: 0.5 }}
                    className="absolute inset-0 bg-red-600"
                  />
                  
                  <div className="relative z-10 flex items-center overflow-hidden h-full">
                    {/* Texto 1: Let's Talk */}
                    <motion.span 
                      variants={{ initial: { y: 0 }, hover: { y: '-150%' } }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="block text-[11px] font-black uppercase tracking-[0.2em] text-white"
                    >
                      Let's Talk
                    </motion.span>
                    
                    {/* Texto 2: CONTACT */}
                    <motion.div
                      variants={{ initial: { y: '150%' }, hover: { y: 0 } }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0 flex items-center justify-center w-full"
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">CONTACT</span>
                    </motion.div>
                  </div>
                </motion.button>
              </Link>

              {/* Menú Móvil Trigger */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* --- 4. MENÚ MÓVIL ESTILIZADO Y ELEGANTE --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050505]/98 backdrop-blur-2xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-6">
              <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Navigation</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-white hover:border-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              {[...NAV_LINKS, { name: 'Estudio', id: '03', href: '#sobre-mi' }, { name: 'Contact', id: '04', href: '#contacto' }].map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1, ease: "easeOut" }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between group border-b border-white/5 pb-6"
                  >
                    <span className="text-4xl md:text-5xl font-black text-zinc-400 group-hover:text-white transition-colors uppercase tracking-tighter">
                      {link.name}
                    </span>
                    <ArrowRight className="text-zinc-700 group-hover:text-red-500 -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto flex justify-between items-end pt-8">
               <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="opacity-80 drop-shadow-md" />
               <div className="text-right text-[10px] font-mono text-zinc-500">
                  <p>SEVILLA — SPAIN</p>
                  <p>{new Date().getFullYear()} © DANIEL RAYO</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}