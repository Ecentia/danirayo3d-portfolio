"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin, CURRENT_SLUG } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export type SketchfabModel = {
  id: string;
  title: string;
  modelId: string;
};

export default function SketchfabGallery() {
  const { isAdmin } = useAdmin();
  const { isSpanish } = useLanguage();
  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados del formulario (Solo para Admin)
  const [newTitle, setNewTitle] = useState("");
  const [newModelId, setNewModelId] = useState("");

  // 1. Cargar datos al inicio
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const slug = CURRENT_SLUG || "danirayo";
        const { data } = await supabase
          .from("portfolio_content")
          .select("description")
          .eq("client_slug", slug)
          .eq("section_id", "sketchfab_gallery")
          .maybeSingle();

        if (data && data.description) {
          setModels(JSON.parse(data.description));
        }
      } catch (e) {
        console.error("Error cargando la galería 3D", e);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [isSpanish]);

  // 2. Lógica para guardar en Supabase
  const updateDatabase = async (updatedModels: SketchfabModel[]) => {
    setIsSaving(true);
    try {
      const slug = CURRENT_SLUG || "danirayo";
      const { error } = await supabase.from("portfolio_content").upsert(
        {
          client_slug: slug,
          section_id: "sketchfab_gallery",
          description: JSON.stringify(updatedModels),
          title: "3D Assets Gallery",
        },
        { onConflict: "client_slug, section_id" },
      );

      if (error) throw error;
      setModels(updatedModels);
    } catch (e) {
      console.error("Error guardando modelos:", e);
      alert(isSpanish ? "Error al guardar en la base de datos." : "Error saving to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Añadir Modelo
  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newModelId.trim()) return;

    // Limpiar la URL de Sketchfab por si pegan el enlace completo en vez del ID
    let finalId = newModelId.trim();
    if (finalId.includes("sketchfab.com")) {
      const parts = finalId.split("-");
      finalId = parts[parts.length - 1]; // Coge la cadena final
      // Si la URL termina en una barra inclinada o tiene parámetros de consulta
      if (finalId.includes("?")) {
        finalId = finalId.split("?")[0];
      }
      if (finalId.endsWith("/")) {
        finalId = finalId.slice(0, -1);
      }
    }

    const newModel = {
      id: Date.now().toString(),
      title: newTitle,
      modelId: finalId,
    };
    const newArray = [...models, newModel];
    updateDatabase(newArray);
    setNewTitle("");
    setNewModelId("");
  };

  // 4. Borrar Modelo
  const handleDeleteModel = (idToRemove: string) => {
    const confirmMsg = isSpanish
      ? "¿Estás seguro de que deseas eliminar este modelo 3D?"
      : "Are you sure you want to delete this 3D model?";
    if (!confirm(confirmMsg)) return;
    const newArray = models.filter((m) => m.id !== idToRemove);
    updateDatabase(newArray);
  };

  // Si no hay modelos Y NO es admin, no renderiza NADA
  if (!loading && models.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <section
      className="w-full max-w-[1600px] mx-auto my-12 px-6 sm:px-12 font-mono relative z-10"
      id="assets-3d"
    >
      {/* Título de la Sección (Estilo Cyberpunk Amarillo) */}
      <div className="flex items-center gap-4 mb-10">
        <Box className="text-yellow-500" size={24} strokeWidth={1.5} />
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] uppercase">
          {isSpanish ? "MODELOS" : "3D"}{" "}
          <span className="text-yellow-500">{isSpanish ? "INTERACTIVOS 3D" : "INTERACTIVE MODELS"}</span>
        </h2>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-yellow-500/30 to-transparent ml-4" />
      </div>

      {/* PANEL DE CONTROL INLINE (SOLO ADMIN) */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-10 bg-yellow-950/10 border border-yellow-500/35 p-6 rounded-sm shadow-[0_0_25px_rgba(234,179,8,0.05)] backdrop-blur-md overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-yellow-500" />
              <h3 className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase">
                {isSpanish ? "Panel de Control Admin: Gestionar Modelos 3D Sketchfab" : "Admin override: Manage 3D Sketchfab Models"}
              </h3>
            </div>

            <form
              onSubmit={handleAddModel}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              <div className="flex flex-col gap-2 w-full md:w-1/3">
                <label className="text-[10px] text-neutral-400 tracking-widest uppercase">
                  {isSpanish ? "Título del Modelo" : "Model Title"}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 p-3 text-white placeholder-neutral-600 focus:outline-none transition-all rounded-sm text-xs font-mono"
                  placeholder={isSpanish ? "Ej. Casco Cyberpunk" : "e.g. Cyberpunk Helmet"}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 w-full md:w-1/3">
                <label className="text-[10px] text-neutral-400 tracking-widest uppercase">
                  {isSpanish ? "ID o Enlace de Sketchfab" : "Sketchfab ID / URL"}
                </label>
                <input
                  type="text"
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 p-3 text-white placeholder-neutral-600 focus:outline-none transition-all rounded-sm text-xs font-mono"
                  placeholder="e.g. 5e0d04db0e..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full md:w-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold tracking-[0.2em] uppercase transition-all rounded-sm disabled:opacity-50 flex items-center justify-center gap-2 h-[42px] cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin text-black" />
                ) : (
                  <>
                    <Plus size={16} /> {isSpanish ? "AÑADIR MODELO" : "ADD MODEL"}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado Cargando */}
      {loading && (
        <div className="w-full py-20 flex flex-col items-center justify-center">
          <Loader2 size={32} className="text-yellow-500 animate-spin mb-4" />
          <p className="text-yellow-500 text-xs tracking-widest animate-pulse">
            {isSpanish ? "CONECTANDO A BASE DE DATOS..." : "FETCHING DATABASE..."}
          </p>
        </div>
      )}

      {/* Grid de Modelos */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col gap-3 relative"
            >
              {/* Header del Modelo */}
              <div className="flex justify-between items-center px-2">
                <span className="text-white font-bold text-xs tracking-widest uppercase border-l-2 border-yellow-500 pl-2">
                  {model.title}
                </span>
                <span className="text-neutral-600 text-[9px] tracking-[0.2em]">
                  REALTIME_RENDER
                </span>
              </div>

              {/* Iframe Contenedor */}
              <div className="relative w-full aspect-video bg-black/60 backdrop-blur-xl border border-white/10 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700">
                  <Loader2
                    size={24}
                    className="text-yellow-500 animate-spin mb-3"
                  />
                  <p className="text-yellow-500 text-[9px] tracking-[0.3em] uppercase animate-pulse">
                    {isSpanish ? "INICIALIZANDO GEOMETRÍA..." : "INITIALIZING GEOMETRY..."}
                  </p>
                </div>

                <iframe
                  title={model.title}
                  className="w-full h-full border-none relative z-20"
                  src={`https://sketchfab.com/models/${model.modelId}/embed?autostart=1&ui_infos=0&ui_inspector=0&ui_theme=dark&dnt=1`}
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  execution-while-out-of-viewport="true"
                  execution-while-not-rendered="true"
                />

                <a
                  href={`https://sketchfab.com/3d-models/${model.modelId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 z-30 p-2 bg-black/80 border border-white/10 rounded-sm text-neutral-400 hover:text-white hover:border-yellow-500 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-md"
                >
                  <ExternalLink size={14} />
                </a>

                {/* BOTÓN DE BORRAR (SOLO ADMIN) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    disabled={isSaving}
                    className="absolute top-3 right-3 z-30 p-2 bg-red-950/80 border border-red-500/50 rounded-sm text-red-500 hover:text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer"
                    title={isSpanish ? "Eliminar Modelo" : "Delete Asset"}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
