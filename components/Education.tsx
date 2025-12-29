export default function Education() {
  const studies = [
    { title: "Animaciones 3D y Juegos", place: "Ilerna Sevilla", tech: "UE5 / MAYA" },
    { title: "Sistemas Microinformáticos", place: "Grado Medio SMR", tech: "NETWORKS" }
  ];

  return (
    <section className="py-32 bg-black px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-rayo-red font-mono mb-20 text-2xl tracking-widest">// ACADEMIC_RECORDS</h2>
        <div className="grid md:grid-cols-2 gap-20">
          {studies.map((s, i) => (
            <div key={i} className="group border-l-2 border-white/10 pl-8 hover:border-rayo-red transition-colors">
              <span className="text-rayo-red/50 font-mono text-sm">{s.tech}</span>
              <h3 className="text-4xl font-bold text-white mt-2 group-hover:text-rayo-red transition-colors">{s.title}</h3>
              <p className="text-gray-500 text-xl mt-4 uppercase tracking-tighter">{s.place}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}