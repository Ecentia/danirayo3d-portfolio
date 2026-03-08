"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone, ShieldAlert, Lock } from "lucide-react";

export default function AdminMobileBlocker() {
  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-8 text-center font-mono overflow-hidden">
      {/* Luces de emergencia rojas */}
      <div className="absolute top-0 left-0 w-full h-full bg-red-950/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 space-y-8 max-w-xs"
      >
        {/* Iconografía de restricción */}
        <div className="flex items-center justify-center gap-4 text-red-500">
          <Smartphone size={48} className="opacity-40" />
          <div className="h-[1px] w-8 bg-red-600" />
          <ShieldAlert size={64} className="animate-bounce" />
          <div className="h-[1px] w-8 bg-red-600" />
          <Monitor size={48} />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
            UNSUPPORTED <span className="text-red-600">HARDWARE</span>
          </h2>

          <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-sm">
            <p className="text-red-400 text-[10px] tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
              <Lock size={12} /> Security Protocol 403
            </p>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Administrative console access is restricted to authorized
              workstations only.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-neutral-600 tracking-[0.3em] uppercase animate-pulse">
          Please use a Desktop Device to manage the system core.
        </p>

        {/* Efecto de escáner */}
        <div className="absolute -inset-10 border border-red-500/5 pointer-events-none">
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
