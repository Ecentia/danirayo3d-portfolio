"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CURRENT_SLUG } from "@/context/AdminContext";
// ✅ Importamos el mapa de iconos en vez del componente gigante de PC
import { ICON_MAP } from "@/components/sections/TechStack";
import { TechItem } from "@/types/database";
import { ArrowRight, Sparkles, Box, Code2, Monitor } from "lucide-react";

export default function MobileHome({
  onNavigate,
}: {
  onNavigate: (v: any) => void;
}) {
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("SYNCHRONIZING...");
  const [techList, setTechList] = useState<TechItem[]>([]); // ✅ Estado para las tecnologías
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar Perfil
        const { data: profileData } = await supabase
          .from("portfolio_content")
          .select("title, description")
          .eq("client_slug", CURRENT_SLUG)
          .eq("section_id", "about_me")
          .single();

        // 2. Cargar Tecnologías
        const { data: techData } = await supabase
          .from("tech_stack")
          .select("*")
          .eq("client_slug", CURRENT_SLUG)
          .order("display_order", { ascending: true });

        setTimeout(() => {
          if (profileData) {
            setTitle(profileData.title);
            setDescription(profileData.description);
          } else {
            setTitle("REALITY ARCHITECT");
            setDescription(
              "I'm Daniel Rayo. My code doesn't just compile, it breathes...",
            );
          }
          if (techData) {
            setTechList(techData);
          }
          setIsLoaded(true);
        }, 600);
      } catch (error) {
        console.error("Error loading mobile profile:", error);
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  // --- ANIMACIONES FRAMER MOTION ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 70, damping: 15 },
    },
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[100vw] overflow-x-clip bg-[#030303] relative selection:bg-red-500/30">
      {/* Efectos de fondo */}
      <div
        className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] bg-red-600/15 blur-[100px] rounded-full mix-blend-screen animate-pulse pointer-events-none"
        style={{ animationDuration: "4s" }}
      />
      <div className="absolute bottom-[10%] right-[-20%] w-[60vw] h-[60vw] bg-red-900/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />

      <motion.div
        className="flex flex-col w-full h-full flex-grow pt-8 pb-24 px-6 gap-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* AVATAR PREMIUM */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center text-center mt-2"
        >
          <div className="relative mb-5">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-red-600 via-transparent to-zinc-800 animate-[spin_4s_linear_infinite]" />
            <div className="w-28 h-28 relative z-10 rounded-full overflow-hidden bg-black p-[3px]">
              <div className="w-full h-full relative rounded-full overflow-hidden bg-zinc-900">
                <Image
                  src="/favicon.ico"
                  alt="Daniel Rayo"
                  fill
                  className="object-cover scale-110 hover:scale-100 transition-transform duration-700"
                />
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)] z-20"
            >
              <Box size={14} className="fill-white/20" />
            </motion.div>
          </div>

          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase tracking-tighter mb-2">
            Daniel <span className="text-red-500">Rayo</span>
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-white/5 rounded-full backdrop-blur-md shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
              3D Artist
            </span>
          </div>
        </motion.div>

        {/* TARJETA DE BIO */}
        <motion.div variants={itemVariants} className="w-full relative group">
          <div className="absolute inset-0 bg-red-600/5 blur-2xl rounded-3xl transition-all duration-500 group-hover:bg-red-600/10" />

          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-red-500" />
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                About Me
              </h2>
            </div>

            <div className="space-y-4 min-h-[110px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!isLoaded ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="h-6 w-3/4 bg-white/5 rounded-lg animate-pulse" />
                    <div className="h-4 w-full bg-white/5 rounded-md animate-pulse" />
                    <div className="h-4 w-5/6 bg-white/5 rounded-md animate-pulse" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
                      {title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light whitespace-pre-wrap">
                      {description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => onNavigate("PROJECTS")}
              className="w-full mt-8 relative overflow-hidden bg-zinc-100 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white active:scale-[0.97] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12 z-0" />
              <span className="relative z-10">View Projects</span>
              <ArrowRight size={16} className="relative z-10" />
            </button>
          </div>
        </motion.div>

        {/* ✅ SOFTWARE ARSENAL (REDISEÑADO PARA MÓVIL) */}
        <motion.div variants={itemVariants} className="w-full mt-2">
          <div className="flex items-center gap-3 mb-4 px-1">
            <Code2 size={16} className="text-zinc-500" />
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Tech Stack
            </h2>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="w-full relative">
            {/* Scroll horizontal en 2 filas con máscara de difuminado en los bordes */}
            <div
              className="w-full overflow-x-auto scrollbar-hide pb-4 pt-1"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
              }}
            >
              {/* grid-rows-2 empila los items en 2 filas ahorrando mucho espacio vertical */}
              <div className="grid grid-rows-2 grid-flow-col gap-3 px-4 w-max">
                {!isLoaded
                  ? // Skeletons de carga
                    Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 pr-8 rounded-2xl animate-pulse min-w-[140px]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="h-3 bg-white/10 rounded w-16" />
                      </div>
                    ))
                  : techList.map((tech) => {
                      const IconComponent = ICON_MAP[tech.icon_key] || Monitor;
                      return (
                        <div
                          key={tech.id}
                          className="flex items-center gap-3 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 p-2 pr-5 rounded-2xl shadow-lg min-w-max"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-zinc-800/50 to-black/50 border border-white/5 flex items-center justify-center">
                            <IconComponent
                              size={20}
                              className="text-zinc-400"
                            />
                          </div>
                          {/* whitespace-nowrap asegura que NO se corten los nombres largos */}
                          <span className="text-xs font-bold text-zinc-200 whitespace-nowrap tracking-tight">
                            {tech.name}
                          </span>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
