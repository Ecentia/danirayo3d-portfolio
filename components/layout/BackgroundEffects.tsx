"use client";

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-[-5] overflow-hidden pointer-events-none">
      {/* Orbe Rojo Principal (Lento) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rayo-red/10 rounded-full blur-[120px] animate-pulse-slow" />
      
      {/* Orbe Secundario (Opuesto) */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-rayo-crimson/5 rounded-full blur-[100px] animate-pulse-slower" />
      
      {/* Luz central sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-rayo-red/5 rounded-full blur-[150px]" />
    </div>
  );
}