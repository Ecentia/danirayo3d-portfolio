"use client";
import { motion } from "framer-motion";

const projects = [
  { id: 1, title: "Modelado Orgánico", category: "ZBrush / Blender", span: "md" },
  { id: 2, title: "Escenario Unreal Engine 5", category: "Game Dev", span: "lg" },
  { id: 3, title: "Rigging de Personajes", category: "Maya", span: "sm" },
  { id: 4, title: "Proyecto SMR", category: "Redes e Infraestructura", span: "sm" },
];

export default function Projects() {
  return (
    <section className="py-24 bg-rayo-black px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-mono font-bold text-white mb-16 tracking-tighter">
          TRABAJOS <span className="text-rayo-red">SELECCIONADOS</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {projects.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -10 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-rayo-dark
                ${item.span === 'lg' ? 'md:col-span-2 md:row-span-2' : ''}
                ${item.span === 'md' ? 'md:col-span-2' : ''}
              `}
            >
              {/* Overlay Rojo al pasar el ratón */}
              <div className="absolute inset-0 bg-gradient-to-t from-rayo-crimson/80 via-rayo-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10" />
              
              {/* Contenido */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <p className="text-rayo-red font-mono text-sm mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {item.category}
                </p>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {item.title}
                </h3>
              </div>
              
              {/* Imagen o Video de fondo (Placeholder) */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?q=80&w=2070')] bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}