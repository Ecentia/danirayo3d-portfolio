"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { ShieldAlert, Lock, Terminal, Box } from "lucide-react";
import Link from "next/link";

export default function MobileMaintenance() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-[#030000] flex flex-col items-center justify-center p-6 z-[200] font-mono text-white overflow-hidden">
      {/* Luz volumétrica roja de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/15 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Grid sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a0000_1px,transparent_1px),linear-gradient(to_bottom,#1a0000_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none z-0" />

      <motion.div
        className="flex flex-col items-center text-center w-full max-w-sm relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* AVATAR BLOQUEADO */}
        <motion.div variants={itemVariants} className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-red-600/10 blur-xl animate-pulse" />
          <div className="w-24 h-24 relative z-10 rounded-full border-2 border-red-600 p-1 bg-black">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative grayscale opacity-30">
              <Image
                src="/favicon.ico"
                alt="Rayo"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Lock
                size={32}
                className="text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,1)]"
              />
            </div>
          </div>
        </motion.div>

        {/* TEXTO DE ESTADO */}
        <motion.div variants={itemVariants} className="space-y-2 mb-10">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            SYSTEM <span className="text-red-600">OFFLINE</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] text-red-500 font-bold tracking-[0.4em] uppercase italic">
              Maintenance_Mode: Active
            </span>
          </div>
        </motion.div>

        {/* TARJETA DE INFORMACIÓN */}
        <motion.div
          variants={itemVariants}
          className="w-full relative group mb-10"
        >
          <div className="absolute -inset-px bg-gradient-to-b from-red-600/30 to-transparent rounded-2xl" />
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 200, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-[1px] bg-red-600/40 blur-sm pointer-events-none"
            />

            <div className="flex flex-col items-center gap-4">
              <ShieldAlert size={24} className="text-red-600 animate-bounce" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-tight">
                Geometry Recalculation <br /> In Progress
              </h2>
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                The platform is undergoing scheduled core upgrades. Render
                completion pending.
              </p>
            </div>

            <div className="w-full h-[2px] bg-white/5 rounded-full mt-6 overflow-hidden relative">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
              />
            </div>
          </div>
        </motion.div>

        {/* ADMIN OVERRIDE */}
        <motion.div variants={itemVariants}>
          <Link
            href="/admin"
            className="text-[9px] text-zinc-700 hover:text-red-500 transition-colors tracking-[0.5em] uppercase flex items-center gap-2"
          >
            <Terminal size={10} /> Admin_Override
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
