'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/context/AdminContext';
import { Settings, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();
  
  // Línea de progreso de lectura (Scroll Progress)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Proyectos', href: '#proyectos' },
    { name: 'Trayectoria', href: '#trayectoria' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          isScrolled 
            ? 'py-3 bg-black/40 backdrop-blur-2xl border-b border-white/[0.08]' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          
          {/* --- LOGO EVOLUCIONADO --- */}
          <Link href="/" className="group flex items-center gap-4 outline-none">
            <div className="relative w-10 h-10 flex items-center justify-center">
              {/* Efecto de pulso en el logo */}
              <div className="absolute inset-0 bg-red-600/20 rounded-full blur-md group-hover:scale-150 group-hover:bg-red-600/40 transition-all duration-700"></div>
              <Image 
                src="/favicon.ico" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="relative z-10 filter drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] group-hover:rotate-[360deg] transition-all duration-1000"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter text-xl leading-none">
                DANIEL <span className="text-red-600">RAYO</span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-mono text-zinc-500 tracking-[0.2em] uppercase">
                  {isAdmin ? 'System_Operator' : 'Active_Session'}
                </span>
              </div>
            </div>
          </Link>

          {/* --- NAVEGACIÓN (Desktop) --- */}
          <nav className="hidden lg:flex items-center bg-zinc-900/40 border border-white/[0.05] rounded-full px-2 py-1.5 backdrop-blur-md shadow-inner">
            <ul className="flex items-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="relative px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all duration-300 group/link"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <motion.span 
                      className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"
                      layoutId="nav-hover"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- ACCIONES --- */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="hidden md:flex p-2.5 text-zinc-400 hover:text-red-500 transition-all bg-white/[0.03] border border-white/5 rounded-full hover:border-red-500/50"
              >
                <Settings size={18} />
              </Link>
            )}

            <Link href="#contacto" className="hidden sm:block">
              <button className="group relative px-7 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all hover:pr-10">
                <span className="relative z-10">Contactar</span>
                <ArrowUpRight className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={14} />
              </button>
            </Link>

            {/* Menú Móvil Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-white bg-zinc-900 border border-white/10 rounded-full"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Línea de progreso de lectura (Pro) */}
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent"
          style={{ scaleX, originX: 0 }}
        />
      </motion.header>

      {/* --- MENÚ MÓVIL FULLSCREEN --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-16">
              <Image src="/favicon.ico" alt="Logo" width={40} height={40} />
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-white/5 border border-white/10 rounded-full text-white">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-black tracking-tighter text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.name}<span className="text-red-600">.</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-8 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Social_Uplink</p>
                <div className="flex gap-4 text-white font-bold text-xs">
                  <span>IG</span> <span>AS</span>
                </div>
              </div>
              <Link href="#contacto" onClick={() => setMobileMenuOpen(false)}>
                <button className="px-8 py-4 bg-red-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">
                  Iniciar Proyecto
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}