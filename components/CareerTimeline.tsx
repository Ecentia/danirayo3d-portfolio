import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import { Briefcase, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { ExperienceItem } from "@/types/database";

type Filter = "all" | "work" | "education";

const FILTERS: readonly Filter[] = ["all", "work", "education"];

const FILTER_LABELS: Record<Filter, { es: string; en: string }> = {
  all: { es: "Todo", en: "All" },
  work: { es: "Profesional", en: "Work" },
  education: { es: "Formación", en: "Education" },
};

const getTranslation = (value: string | null, isSpanish: boolean): string => {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return (isSpanish ? parsed.es : parsed.en) || parsed.en || parsed.es || value;
    }
  } catch {
    // No es JSON: el valor es texto plano sin traducciones y se devuelve tal cual
  }
  return value;
};

interface CareerTimelineProps {
  experienceList: ExperienceItem[];
  isAdmin: boolean;
  isSpanish: boolean;
  onEdit: (item: ExperienceItem) => void;
  onDelete: (id: string) => void;
}

// Línea de experiencia como panel HTML junto al planeta. Sustituye al aro de tarjetas 3D:
// con varias entradas se solapaban, el texto 3D era difícil de leer y la tarjeta más
// cercana a la cámara quedaba enorme.
export default function CareerTimeline({
  experienceList,
  isAdmin,
  isSpanish,
  onEdit,
  onDelete,
}: CareerTimelineProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: experienceList.length,
      work: experienceList.filter((item) => item.type === "work").length,
      education: experienceList.filter((item) => item.type === "education").length,
    }),
    [experienceList],
  );

  const items = useMemo(
    () => (filter === "all" ? experienceList : experienceList.filter((item) => item.type === filter)),
    [experienceList, filter],
  );

  return (
    // Fondo casi opaco en lugar de backdrop-blur: desenfocar el canvas WebGL que hay
    // detrás obligaba a recalcular el blur en cada frame
    <Html position={[2.8, 0, 0]} center distanceFactor={5.0}>
      <div
        data-panel
        className="animate-fade-in flex w-[560px] select-none flex-col rounded-2xl border border-white/[0.08] bg-[#0b0b0c]/95 font-sans text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        <div
          role="group"
          aria-label={isSpanish ? "Filtrar experiencia" : "Filter experience"}
          className="flex items-center gap-5 border-b border-white/[0.06] px-7 pb-4 pt-6 text-[13px]"
        >
          {FILTERS.map((key) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setFilter(key);
                  setExpandedId(null);
                }}
                className={`relative cursor-pointer pb-1 transition-colors duration-300 ${
                  active ? "text-white" : "text-white/40 hover:text-white/80"
                }`}
              >
                {isSpanish ? FILTER_LABELS[key].es : FILTER_LABELS[key].en}
                <span className="ml-1.5 tabular-nums text-white/30">{counts[key]}</span>
                <span
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-300 ease-out ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Altura fija: con altura variable el panel (centrado en su punto 3D) saltaba al filtrar */}
        <ol className="custom-scrollbar h-[460px] overflow-y-auto overscroll-contain px-7">
          {items.map((item) => {
            const isWork = item.type === "work";
            const expanded = expandedId === item.id;
            const title = getTranslation(item.title, isSpanish);
            const description = getTranslation(item.description, isSpanish).trim();
            const hasDescription = description.length > 0;

            return (
              <li key={item.id} className="group border-b border-white/[0.06] last:border-b-0">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    disabled={!hasDescription}
                    aria-expanded={hasDescription ? expanded : undefined}
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-start gap-4 py-5 text-left disabled:cursor-default"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60">
                      {isWork ? <Briefcase size={14} /> : <GraduationCap size={14} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] tabular-nums text-white/40">
                        {item.start_date} —{" "}
                        {item.end_date ? (
                          item.end_date
                        ) : (
                          <span className="text-emerald-400/90">{isSpanish ? "Actualidad" : "Present"}</span>
                        )}
                      </span>
                      <span className="mt-1 block text-[16px] font-medium leading-snug tracking-[-0.01em] text-white">
                        {title}
                      </span>
                      <span className="mt-0.5 block text-[14px] text-white/55">{item.organization}</span>
                    </span>
                    {hasDescription && (
                      <span
                        aria-hidden
                        className={`mt-1.5 text-lg leading-none text-white/40 transition-transform duration-300 ease-out ${
                          expanded ? "rotate-45 text-white/70" : ""
                        }`}
                      >
                        +
                      </span>
                    )}
                  </button>

                  {isAdmin && (
                    <div className="flex shrink-0 gap-1 pt-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="cursor-pointer rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                        title={isSpanish ? "Editar" : "Edit"}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="cursor-pointer rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-red-400"
                        title={isSpanish ? "Eliminar" : "Delete"}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Descripción desplegable: grid-rows 0fr → 1fr anima la altura sin medir el DOM */}
                {hasDescription && (
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="whitespace-pre-wrap pb-5 pl-12 text-[14px] leading-relaxed text-white/60">
                        {description}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          {items.length === 0 && (
            <li className="py-10 text-center text-sm text-white/40">
              {isSpanish ? "No hay registros en esta categoría" : "No entries in this category"}
            </li>
          )}
        </ol>
      </div>
    </Html>
  );
}
