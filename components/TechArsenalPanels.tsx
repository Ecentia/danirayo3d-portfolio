import { Html } from "@react-three/drei";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { TechItem } from "@/types/database";
import { ICON_MAP } from "@/components/sections/TechStack";
import { Monitor, Video, Plus, Trash2 } from "lucide-react";

interface TechArsenalPanelsProps {
  techList: TechItem[];
  isSpanish: boolean;
  openAddModal: (category: string) => void;
  onDelete: (id: string) => void;
}

export default function TechArsenalPanels({ techList, isSpanish, openAddModal, onDelete }: TechArsenalPanelsProps) {
  const { isAdmin } = useAdmin();

  const texturingItems = techList.filter((t) => t.category === "3D & TEXTURING");
  const creativeItems = techList.filter((t) => t.category === "POST & CREATIVE");

  const renderPanel = (
    title: string,
    items: TechItem[],
    icon: React.ReactNode,
    borderColor: string,
    glowColor: string,
    categoryKey: string
  ) => {
    return (
      <div
        className="w-[540px] bg-zinc-950/90 border border-purple-500/20 backdrop-blur-xl rounded-2xl p-6 select-none font-mono flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative animate-fade-in"
        style={{
          boxShadow: `0 0 40px rgba(176, 38, 255, 0.08), inset 0 0 20px rgba(176, 38, 255, 0.04)`,
          borderColor: borderColor,
        }}
      >
        {/* Cyber Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: glowColor }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: glowColor }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: glowColor }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: glowColor }} />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
          <div className="flex items-center gap-3">
            <div style={{ color: glowColor }}>{icon}</div>
            <span className="text-white text-sm font-black uppercase tracking-[0.25em]">{title}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => openAddModal(categoryKey)}
              className="flex items-center justify-center p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-purple-400 transition-all cursor-pointer"
              title={isSpanish ? "Añadir software a esta categoría" : "Add software to this category"}
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon_key] || Monitor;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.03] transition-all duration-300 hover:bg-purple-950/20 hover:border-purple-500/30 group relative"
              >
                {isAdmin && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="absolute top-1 right-1 bg-black/80 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-950 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-purple-500/40 transition-colors">
                  <IconComponent size={20} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white truncate">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <group>
      {/* Panel Izquierdo: 3D & Texturing */}
      <Html position={[-2.65, 0, 0]} center distanceFactor={5.0}>
        {renderPanel(
          isSpanish ? "3D y Texturizado" : "3D & Texturing",
          texturingItems,
          <Monitor size={16} />,
          "rgba(176, 38, 255, 0.25)",
          "#b026ff",
          "3D & TEXTURING"
        )}
      </Html>

      {/* Panel Derecho: Post & Creative */}
      <Html position={[2.65, 0, 0]} center distanceFactor={5.0}>
        {renderPanel(
          isSpanish ? "Postproducción y Creativo" : "Post & Creative",
          creativeItems,
          <Video size={16} />,
          "rgba(176, 38, 255, 0.25)",
          "#b026ff",
          "POST & CREATIVE"
        )}
      </Html>
    </group>
  );
}
