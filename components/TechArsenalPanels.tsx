import { Html } from "@react-three/drei";
import { useAdmin } from "@/context/AdminContext";
import { TechItem } from "@/types/database";
import { ICON_MAP } from "@/components/sections/TechStack";
import { Monitor, Plus, Trash2 } from "lucide-react";

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

  const renderPanel = (title: string, items: TechItem[], categoryKey: string) => {
    return (
      // Fondo casi opaco en lugar de backdrop-blur: desenfocar el canvas WebGL
      // que hay detrás obligaba a recalcular el blur en cada frame
      <div
        data-panel
        className="animate-fade-in relative flex w-[540px] select-none flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#0b0b0c]/95 p-7 font-sans text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-medium tracking-tight text-white">{title}</span>
            <span className="text-[13px] tabular-nums text-white/35">{items.length}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => openAddModal(categoryKey)}
              className="flex cursor-pointer items-center gap-1 text-[13px] text-white/50 transition-colors hover:text-white"
              title={isSpanish ? "Añadir software a esta categoría" : "Add software to this category"}
            >
              <Plus size={13} />
              {isSpanish ? "Añadir" : "Add"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon_key] || Monitor;
            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 border-t border-white/[0.06] py-3"
              >
                <IconComponent
                  size={18}
                  className="shrink-0 text-white/40 transition-colors duration-300 group-hover:text-white"
                />
                <span className="truncate text-[15px] text-white/75 transition-colors duration-300 group-hover:text-white">
                  {item.name}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="ml-auto cursor-pointer p-1 text-white/40 opacity-0 transition-opacity duration-200 hover:text-red-400 group-hover:opacity-100"
                    title={isSpanish ? "Eliminar" : "Delete"}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
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
        {renderPanel(isSpanish ? "3D y texturizado" : "3D & texturing", texturingItems, "3D & TEXTURING")}
      </Html>

      {/* Panel Derecho: Post & Creative */}
      <Html position={[2.65, 0, 0]} center distanceFactor={5.0}>
        {renderPanel(isSpanish ? "Postproducción y creativo" : "Post & creative", creativeItems, "POST & CREATIVE")}
      </Html>
    </group>
  );
}
