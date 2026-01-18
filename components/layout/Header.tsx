'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Terminal, 
  User,
  ExternalLink
} from 'lucide-react';

export default function Header() {
  const { isAdmin, logout, isModalOpen } = useAdmin();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para cambiar la apariencia
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Si hay un modal de proyecto o experiencia abierto, ocultamos el Header
  if (isModalOpen) return null;

  const navLinks = [
    { name: 'Proyectos', href: '#proyectos' },
    { name: 'Trayectoria', href: '#trayectoria' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none">
      <nav className={`
        max-w-7xl mx-auto flex items-center justify-between pointer-events-auto
        transition-all duration-500 ease-in-out px-6 md:px-8 py-4 rounded-2xl
        ${scrolled 
          ? 'bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
          : 'bg-transparent border border-transparent'}
      `}>
        
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-3 outline-none">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white font-black italic tracking-tighter text-xl md:text-2xl">
              DANI<span className="text-red-600">RAYO</span>
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* ACCIONES DE ADMINISTRADOR (WEB NORMAL) */}
          <AnimatePresence>
            {isAdmin && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 pl-6 border-l border-white/10"
              >
                {/* Botón Control Central: Solo visible si no estamos en /admin */}
                {pathname !== '/admin' && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 bg-zinc-900 hover:bg-white hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg"
                  >
                    <LayoutDashboard size={14} /> 
                    Control Central
                  </Link>
                )}

                {/* Botón Logout */}
                <button 
                  onClick={logout}
                  className="group flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors py-2"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 text-white hover:text-red-600 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[110] p-8 flex flex-col pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-white font-black italic tracking-tighter text-2xl">DANI<span className="text-red-600">RAYO</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-red-500">
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black uppercase italic tracking-tighter text-zinc-800 hover:text-white transition-all"
                >
                  {link.name}
                </Link>
              ))}
              
              {isAdmin && (
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-6">
                  {pathname !== '/admin' && (
                    <Link 
                      href="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-red-600 font-black uppercase tracking-widest"
                    >
                      <LayoutDashboard size={24} /> Control Central
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-4 text-zinc-500 font-black uppercase tracking-widest"
                  >
                    <LogOut size={24} /> Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}