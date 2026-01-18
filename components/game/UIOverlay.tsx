"use client";

import React, { useState } from "react";
import { 
  Cpu, Mail, X, Gamepad2, Lock, Trophy, Heart, User, Zap
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import MissionLog from "./windows/MissionLog";
import TechInventory from "./windows/TechInventory";

export default function UIOverlay() {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const { user } = useAdmin(); 
  const [showLogin, setShowLogin] = useState(false);

  const menuItems = [
    { id: "projects", label: "MISIONES", icon: Gamepad2, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500" },
    { id: "skills", label: "ARMAMENTO", icon: Cpu, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500" },
    { id: "experience", label: "HISTORIA", icon: Trophy, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500" },
    { id: "contact", label: "COMMS", icon: Mail, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500" },
  ];

  const toggleWindow = (id: string) => {
    setActiveWindow(activeWindow === id ? null : id);
    setShowLogin(false);
  };

  return (
    <div id="ui-layer" className="font-sans">
      
      {/* --- 1. HUD PERFIL (Izquierda Arriba) --- */}
      <div className="absolute top-8 left-8 flex items-center gap-5 pointer-events-none select-none animate-in slide-in-from-left duration-700">
        
        {/* Avatar Container */}
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-yellow-500 rotate-6 rounded-xl opacity-20"></div>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-2 border-yellow-500/50 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
                <User size={40} className="text-white/80" />
                {/* Indicador Online */}
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse"></div>
            </div>
        </div>

        {/* Info Stats */}
        <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black italic text-white tracking-tighter drop-shadow-lg" style={{textShadow: "0 2px 0 #000"}}>
                DANIEL RAYO
            </h1>
            <div className="flex items-center gap-3">
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded skew-x-[-10deg]">
                    LVL. SENIOR
                </span>
                <span className="text-white/50 text-xs font-mono tracking-widest flex items-center gap-1">
                    <Zap size={12} className="text-yellow-400" /> GAME DEV
                </span>
            </div>
            {/* Corazones */}
            <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Heart key={i} size={20} className="fill-red-500 text-red-600 drop-shadow-sm" />
                ))}
            </div>
        </div>
      </div>

      {/* --- 2. BOTÓN ADMIN (Derecha Arriba) --- */}
      <div className="absolute top-8 right-8 pointer-events-auto">
        <button 
          onClick={() => { setActiveWindow("admin-login"); setShowLogin(true); }}
          className="group p-3 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 hover:border-yellow-400 rounded-full transition-all duration-300"
        >
          {user ? 
            <div className="w-5 h-5 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]" /> : 
            <Lock size={20} className="text-white/30 group-hover:text-white transition-colors" />
          }
        </button>
      </div>

      {/* --- 3. VENTANA MODAL (Centro) --- */}
      {activeWindow && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="interactive relative w-[90vw] max-w-6xl h-[80vh] bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Window Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">
                        {menuItems.find(m => m.id === activeWindow)?.label || "SISTEMA"}
                    </h2>
                </div>
                <button 
                    onClick={() => setActiveWindow(null)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Window Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[url('/grid.png')] bg-repeat opacity-90">
                {activeWindow === 'projects' && <MissionLog />}
                {activeWindow === 'skills' && <TechInventory />}
                {activeWindow === 'admin-login' && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl bg-black/20">
                        <Lock size={64} className="text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">PANEL DE CONTROL</h3>
                        <p className="text-gray-500 font-mono text-sm">Introduce tus credenciales de Dios.</p>
                      </div>
                      {user && <div className="text-green-400 font-mono border border-green-500/30 bg-green-500/10 px-4 py-2 rounded-lg">SESIÓN ACTIVA: {user.email}</div>}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* --- 4. DOCK INFERIOR (Menú Principal) --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-6 pointer-events-auto">
        {menuItems.map((item) => (
            <button
                key={item.id}
                onClick={() => toggleWindow(item.id)}
                className={`group relative flex flex-col items-center gap-3 transition-all duration-300 ${activeWindow === item.id ? '-translate-y-4' : 'hover:-translate-y-2'}`}
            >
                {/* Icono Container */}
                <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-2xl 
                    ${item.bg} backdrop-blur-md border-2 ${item.border}
                    flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]
                    group-hover:shadow-[0_0_50px_rgba(var(--glow-color),0.5)]
                    transition-all duration-300 relative overflow-hidden
                `}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <item.icon size={32} className={`${item.color} drop-shadow-md`} strokeWidth={2} />
                </div>

                {/* Etiqueta */}
                <span className="font-mono text-xs font-bold text-white/60 tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                </span>
            </button>
        ))}
      </div>

    </div>
  );
}