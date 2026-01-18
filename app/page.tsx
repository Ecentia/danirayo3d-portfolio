"use client";

import dynamic from 'next/dynamic';
import UIOverlay from '@/components/game/UIOverlay';

// Importamos la escena 3D dinámicamente para evitar errores de SSR (Server Side Rendering)
// y mejorar el tiempo de carga inicial.
const GameScene = dynamic(() => import('@/components/game/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-yellow-400 font-mono z-50">
      <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="animate-pulse tracking-widest">INITIALIZING LEGO WORLD...</span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden">
      
      {/* CAPA 1: La Interfaz de Usuario (HUD) */}
      {/* Esta capa maneja ventanas, menús y estado, flotando sobre el juego */}
      <UIOverlay />

      {/* CAPA 0: El Mundo 3D */}
      {/* Ocupa todo el fondo. Los clics pasan a través de la UI (pointer-events-none) hasta llegar aquí */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>
      
    </main>
  );
}