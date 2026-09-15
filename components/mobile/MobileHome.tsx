"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CURRENT_SLUG } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
// ✅ Importamos el mapa de iconos en vez del componente gigante de PC
import { ICON_MAP } from "@/components/sections/TechStack";
import { TechItem } from "@/types/database";
import { ArrowRight, Monitor } from "lucide-react";
import type { ViewState } from "./MobileShell";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

// Sin filter: blur — en móviles de gama media cada frame con blur cuesta mucho
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MobileHome({
  onNavigate,
}: {
  onNavigate: (view: ViewState) => void;
}) {
  const { isSpanish } = useLanguage();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [techList, setTechList] = useState<TechItem[]>([]); // ✅ Estado para las tecnologías
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        // Si falta la versión del idioma pedido se usa la otra (about_me_en no existía)
        const preferredSection = isSpanish ? "about_me" : "about_me_en";

        // Perfil y tecnologías en paralelo (antes iban en serie + 600 ms de espera artificial)
        const [profileResult, techResult] = await Promise.all([
          supabase
            .from("portfolio_content")
            .select("section_id, title, description")
            .eq("client_slug", CURRENT_SLUG)
            .in("section_id", ["about_me", "about_me_en"]),
          supabase
            .from("tech_stack")
            .select("*")
            .eq("client_slug", CURRENT_SLUG)
            .order("display_order", { ascending: true }),
        ]);

        if (profileResult.error) {
          console.error("Error loading mobile profile:", profileResult.error.message);
        }
        if (techResult.error) {
          console.error("Error loading mobile tech stack:", techResult.error.message);
        }
        if (cancelled) return;

        const profileData =
          profileResult.data?.find((row) => row.section_id === preferredSection) ??
          profileResult.data?.[0];
        if (profileData) {
          setTitle(profileData.title);
          setDescription(profileData.description);
        } else {
          setTitle(isSpanish ? "Arquitecto de realidades" : "Reality architect");
          setDescription(
            isSpanish
              ? "Soy Daniel Rayo. Mi código no solo compila, respira..."
              : "I'm Daniel Rayo. My code doesn't just compile, it breathes..."
          );
        }
        if (techResult.data) {
          setTechList(techResult.data);
        }
      } catch (error) {
        console.error("Error loading mobile profile:", error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isSpanish]);

  return (
    <div className="relative flex min-h-[100dvh] w-full max-w-[100vw] flex-col overflow-x-clip bg-[#030303] selection:bg-red-500/30">
      <motion.div
        className="relative z-10 flex h-full w-full flex-grow flex-col gap-12 px-6 pb-24 pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* PRESENTACIÓN */}
        <motion.div variants={itemVariants} className="flex flex-col items-start">
          <div className="relative mb-7 h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
            <Image
              src="/favicon.ico"
              alt="Daniel Rayo"
              fill
              sizes="64px"
              className="scale-110 object-cover"
            />
          </div>

          <h1 className="text-[2.9rem] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
            Daniel Rayo
          </h1>
          <p className="mt-3 text-lg font-light text-white/55">
            {isSpanish ? "Artista 3D en Sevilla" : "3D artist based in Seville"}
          </p>
        </motion.div>

        {/* SOBRE MÍ */}
        <motion.section variants={itemVariants} className="flex flex-col">
          <h2 className="mb-3 text-sm text-white/40">
            {isSpanish ? "Sobre mí" : "About me"}
          </h2>

          <div className="flex min-h-[110px] flex-col justify-center">
            <AnimatePresence mode="wait">
              {!isLoaded ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <div className="h-6 w-3/4 animate-pulse rounded-lg bg-white/5" />
                  <div className="h-4 w-full animate-pulse rounded-md bg-white/5" />
                  <div className="h-4 w-5/6 animate-pulse rounded-md bg-white/5" />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-white">
                    {title}
                  </h3>
                  <p className="whitespace-pre-wrap text-[15px] font-light leading-relaxed text-white/65">
                    {description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("PROJECTS")}
            className="mt-8 flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-[15px] font-medium text-black transition-transform duration-300 active:scale-[0.98]"
          >
            <span>{isSpanish ? "Ver proyectos" : "View projects"}</span>
            <ArrowRight size={17} />
          </button>
        </motion.section>

        {/* HERRAMIENTAS */}
        <motion.section variants={itemVariants} className="w-full">
          <h2 className="mb-4 text-sm text-white/40">
            {isSpanish ? "Herramientas" : "Toolkit"}
          </h2>

          {/* Scroll horizontal en 2 filas con máscara de difuminado en el borde derecho */}
          <div
            className="scrollbar-hide -mx-6 w-[calc(100%+3rem)] overflow-x-auto pb-2"
            style={{
              maskImage: "linear-gradient(to right, black 85%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black 85%, transparent)",
            }}
          >
            <div className="grid w-max grid-flow-col grid-rows-2 gap-2 px-6">
              {!isLoaded
                ? // Skeletons de carga
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 min-w-[120px] animate-pulse rounded-full bg-white/5"
                    />
                  ))
                : techList.map((tech) => {
                    const IconComponent = ICON_MAP[tech.icon_key] || Monitor;
                    return (
                      <div
                        key={tech.id}
                        className="flex min-w-max items-center gap-2 rounded-full border border-white/[0.08] px-3.5 py-2"
                      >
                        <IconComponent size={14} className="text-white/50" />
                        {/* whitespace-nowrap asegura que NO se corten los nombres largos */}
                        <span className="whitespace-nowrap text-sm text-white/80">
                          {tech.name}
                        </span>
                      </div>
                    );
                  })}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
