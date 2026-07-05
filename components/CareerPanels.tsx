import { Html } from "@react-three/drei";
import { Briefcase, GraduationCap, Plus, Trash2, Pencil, Calendar, ArrowRight } from "lucide-react";
import { ExperienceItem } from "@/types/database";
import { useLanguage } from "@/context/LanguageContext";

interface CareerPanelsProps {
  experienceList: ExperienceItem[];
  isAdmin: boolean;
  onAdd: (type: "work" | "education") => void;
  onEdit: (item: ExperienceItem) => void;
  onDelete: (id: string) => void;
}

const getTranslation = (value: string | null, isSpanish: boolean): string => {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return (isSpanish ? parsed.es : parsed.en) || parsed.en || parsed.es || value;
    }
  } catch (e) {}
  return value;
};

export default function CareerPanels({
  experienceList,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
}: CareerPanelsProps) {
  const { isSpanish } = useLanguage();
  
  const educationItems = experienceList.filter((item) => item.type === "education");
  const workItems = experienceList.filter((item) => item.type === "work");

  const renderCard = (item: ExperienceItem) => {
    const isWork = item.type === "work";
    const translatedTitle = getTranslation(item.title, isSpanish);
    const translatedDesc = getTranslation(item.description, isSpanish);

    return (
      <div
        key={item.id}
        className="group relative bg-[#070709]/80 border border-zinc-900 hover:border-green-500/30 rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 shadow-lg"
      >
        {/* Glow Line Hover */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-green-500/0 group-hover:bg-green-500 transition-colors" />

        {/* Metadatos (Fechas y Acciones) */}
        <div className="flex items-center justify-between">
          {/* Rango de Fechas */}
          <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 tracking-wider">
            <Calendar size={10} className="text-zinc-600" />
            <span>{item.start_date}</span>
            <ArrowRight size={8} className="text-zinc-700" />
            <span>{item.end_date || <span className="text-green-500 font-black">{isSpanish ? "ACTIVO" : "ACTIVE"}</span>}</span>
          </div>

          {/* Botones de Control de Administrador */}
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-zinc-600 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all rounded"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-zinc-600 hover:text-red-500 bg-zinc-950 border border-zinc-900 hover:border-red-950 transition-all rounded"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Puesto & Organización */}
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-bold text-white leading-snug group-hover:text-green-400 transition-colors duration-300">
            {translatedTitle}
          </h4>
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
            {item.organization}
          </span>
        </div>

        {/* Descripción */}
        {translatedDesc && (
          <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap font-sans">
            {translatedDesc}
          </p>
        )}
      </div>
    );
  };

  const renderPanel = (
    title: string,
    items: ExperienceItem[],
    icon: React.ReactNode,
    type: "work" | "education"
  ) => {
    return (
      <div
        className="w-[450px] h-[520px] bg-zinc-950/90 border border-green-500/20 backdrop-blur-xl rounded-2xl p-6 select-none font-mono flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative animate-fade-in text-white"
        style={{
          boxShadow: `0 0 40px rgba(0, 255, 102, 0.04), inset 0 0 20px rgba(0, 255, 102, 0.02)`,
          borderColor: "rgba(0, 255, 102, 0.25)",
        }}
      >
        {/* Cyber Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg border-green-500/80" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg border-green-500/80" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg border-green-500/80" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg border-green-500/80" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-white text-sm font-black uppercase tracking-[0.25em]">{title}</span>
          </div>

          {/* Admin Insert Button */}
          {isAdmin && (
            <button
              onClick={() => onAdd(type)}
              className="flex items-center gap-1.5 bg-white hover:bg-green-500 text-black hover:text-white px-3 py-1.5 transition-all duration-300 rounded-md font-bold text-[9px] tracking-wider uppercase cursor-pointer"
            >
              <Plus size={10} />
              <span>{isSpanish ? "Añadir" : "Insert"}</span>
            </button>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 custom-scrollbar select-text">
          {items.map(renderCard)}

          {items.length === 0 && (
            <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-600 text-xs">
              {isSpanish ? "[MENSAJE_SISTEMA]: NO SE CARGARON NODOS." : "[SYSTEM_MESSAGE]: NO DATA NODES LOADED."}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <group>
      {/* Panel Izquierdo: Historial Académico */}
      <Html position={[-2.65, 0, 0]} center distanceFactor={5.0}>
        {renderPanel(isSpanish ? "Historial Académico" : "Academic Record", educationItems, <GraduationCap size={16} className="text-green-500" />, "education")}
      </Html>

      {/* Panel Derecho: Historial Laboral */}
      <Html position={[2.65, 0, 0]} center distanceFactor={5.0}>
        {renderPanel(isSpanish ? "Experiencia Laboral" : "Professional Deployments", workItems, <Briefcase size={16} className="text-green-500" />, "work")}
      </Html>
    </group>
  );
}
