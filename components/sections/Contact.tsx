'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
import { SiArtstation, SiInstagram } from 'react-icons/si';

export default function Contact() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const FORMSPREE_ENDPOINT = "https://formspree.io/f/maqyvear";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormStatus('success');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("danielrayo247@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section className="relative w-full py-24 lg:py-32 bg-transparent overflow-hidden border-t border-white/5 z-10">
      
      {/* Aurora animada de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-red-600/10 blur-[120px] rounded-full"
         />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* --- COLUMNA IZQUIERDA: TEXTO E INFO --- */}
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-[1px] bg-red-600"></div>
                <span className="text-red-500 font-bold text-[10px] tracking-[0.5em] uppercase">Contacto</span>
              </div>
              <h3 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6 uppercase">
                 Hablemos de <br/>
                 <span className="text-white/20">tu proyecto.</span>
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md font-light">
                 ¿Tienes una idea en mente? Estoy disponible para colaboraciones freelance y nuevos retos en la industria del 3D y videojuegos.
              </p>
            </div>

            <div className="space-y-6">
               {/* Tarjeta Email Estilo Glass con bordes rectos */}
               <div className="group relative bg-white/5 border border-white/10 p-6 rounded-sm backdrop-blur-md hover:border-red-600/50 transition-all duration-500">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-950 rounded-full text-white border border-white/10 group-hover:bg-red-600 group-hover:border-red-500 transition-all">
                        <Mail size={20} />
                     </div>
                     <div className="flex-1">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Email</div>
                        <div className="text-lg text-white font-medium">danielrayo247@gmail.com</div>
                     </div>
                     <button 
                        onClick={copyToClipboard}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                        title="Copiar email"
                     >
                        {copiedEmail ? <CheckCircle size={20} className="text-green-500"/> : <Copy size={20}/>}
                     </button>
                  </div>
               </div>
            </div>

            {/* Redes Sociales Estilo Proyectos */}
            <div className="flex gap-4">
               <a href="https://www.artstation.com/d_rayo3d/" target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-sm text-zinc-400 hover:text-white hover:border-red-600/50 transition-all backdrop-blur-sm">
                  <SiArtstation size={18}/> <span className="font-bold text-xs tracking-widest uppercase">ArtStation</span>
               </a>
               <a href="https://www.instagram.com/d_rayo.3d/" target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-sm text-zinc-400 hover:text-white hover:border-red-600/50 transition-all backdrop-blur-sm">
                  <SiInstagram size={18}/> <span className="font-bold text-xs tracking-widest uppercase">Instagram</span>
               </a>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: FORMULARIO --- */}
          <div className="relative">
             <div className="bg-white/5 border border-white/10 rounded-sm p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                
                {/* Esquinas tácticas */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                   <div className="space-y-6">
                      <div className="group">
                         <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1 group-focus-within:text-white transition-colors">Nombre</label>
                         <input 
                            type="text" name="name" required placeholder="Tu nombre"
                            // CAMBIO: placeholder-zinc-800 -> placeholder-zinc-500 para que se vea mejor
                            className="w-full bg-zinc-950/50 border border-white/5 rounded-sm px-5 py-4 text-white placeholder-zinc-500 outline-none focus:border-red-600/50 focus:bg-zinc-900/50 transition-all"
                         />
                      </div>

                      <div className="group">
                         <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1 group-focus-within:text-white transition-colors">Email</label>
                         <input 
                            type="email" name="email" required placeholder="ejemplo@correo.com"
                            // CAMBIO: placeholder-zinc-800 -> placeholder-zinc-500
                            className="w-full bg-zinc-950/50 border border-white/5 rounded-sm px-5 py-4 text-white placeholder-zinc-500 outline-none focus:border-red-600/50 focus:bg-zinc-900/50 transition-all"
                         />
                      </div>

                      <div className="group">
                         <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1 group-focus-within:text-white transition-colors">Mensaje</label>
                         <textarea 
                            name="message" required rows={4} placeholder="Cuéntame sobre tu proyecto..."
                            // CAMBIO: placeholder-zinc-800 -> placeholder-zinc-500
                            className="w-full bg-zinc-950/50 border border-white/5 rounded-sm px-5 py-4 text-white placeholder-zinc-500 outline-none focus:border-red-600/50 focus:bg-zinc-900/50 transition-all resize-none"
                         ></textarea>
                      </div>
                   </div>

                   <button 
                      type="submit" 
                      disabled={formStatus === 'submitting' || formStatus === 'success'}
                      className={`w-full py-4 rounded-sm font-bold text-sm uppercase tracking-widest flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-95
                         ${formStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'}
                         ${formStatus === 'submitting' ? 'opacity-70 cursor-wait' : ''}
                      `}
                   >
                      {formStatus === 'idle' && <>Enviar Mensaje <ArrowRight size={18} /></>}
                      {formStatus === 'submitting' && <span className="animate-pulse">Enviando...</span>}
                      {formStatus === 'success' && <>¡Mensaje Enviado! <CheckCircle size={18} /></>}
                      {formStatus === 'error' && <>Error - Reintentar <AlertTriangle size={18} /></>}
                   </button>
                </form>

                <AnimatePresence>
                   {formStatus === 'success' && (
                      <motion.div 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         exit={{ opacity: 0 }}
                         className="absolute inset-0 z-20 bg-[#09090b]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
                      >
                         <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                            <CheckCircle size={40} />
                         </div>
                         <h4 className="text-white font-bold text-2xl mb-2">¡Mensaje Recibido!</h4>
                         <p className="text-zinc-400">Gracias por contactar. Te responderé lo antes posible.</p>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}