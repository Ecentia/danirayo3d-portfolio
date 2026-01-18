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
    /* Reducimos el padding inferior (pb-12) para que pegue con el Footer */
    <section className="relative w-full pt-24 pb-12 lg:pt-32 bg-[#050505] overflow-hidden">
      
      {/* FONDO: AURORA ROJA OPTIMIZADA */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <motion.div 
            animate={{ 
               scale: [1, 1.1, 1],
               opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-red-600/5 blur-[100px] rounded-full"
         />
         <motion.div 
            animate={{ 
               opacity: [0.1, 0.2, 0.1],
               x: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-red-900/5 blur-[120px] rounded-full"
         />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* INFO DE CONTACTO */}
          <div className="space-y-12">
            <div>
              <h2 className="text-red-600 font-bold text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
                 <span className="w-8 h-[2px] bg-red-600"></span> Contacto
              </h2>
              <h3 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6">
                 Hablemos de <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">tu proyecto.</span>
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                 ¿Tienes una idea en mente? Estoy disponible para colaboraciones freelance y nuevos retos en el mundo del 3D y desarrollo.
              </p>
            </div>

            <div className="space-y-6">
               <div className="group relative bg-zinc-900/30 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-900 rounded-full text-white border border-white/10 group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                        <Mail size={20} />
                     </div>
                     <div className="flex-1">
                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Email Profesional</div>
                        <div className="text-lg text-white font-medium">danielrayo247@gmail.com</div>
                     </div>
                     <button 
                        onClick={copyToClipboard}
                        className="p-2 text-zinc-500 hover:text-white transition-colors relative"
                     >
                        {copiedEmail ? <CheckCircle size={20} className="text-green-500"/> : <Copy size={20}/>}
                     </button>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
               <a href="https://www.artstation.com/d_rayo3d/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-zinc-900/50 rounded-full text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all">
                  <SiArtstation size={18}/> <span className="font-bold text-sm tracking-widest uppercase">ArtStation</span>
               </a>
               <a href="https://www.instagram.com/d_rayo.3d/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-zinc-900/50 rounded-full text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all">
                  <SiInstagram size={18}/> <span className="font-bold text-sm tracking-widest uppercase">Instagram</span>
               </a>
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="relative">
             <div className="bg-zinc-900/10 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                   <div className="space-y-6">
                      <div className="group">
                         <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">Nombre</label>
                         <input 
                            type="text" name="name" required placeholder="Cómo te llamas"
                            className="w-full bg-black/40 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-red-600 transition-all"
                         />
                      </div>

                      <div className="group">
                         <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">Email</label>
                         <input 
                            type="email" name="email" required placeholder="tu@email.com"
                            className="w-full bg-black/40 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-red-600 transition-all"
                         />
                      </div>

                      <div className="group">
                         <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase tracking-widest group-focus-within:text-red-500 transition-colors">Mensaje</label>
                         <textarea 
                            name="message" required rows={4} placeholder="Cuéntame tu idea..."
                            className="w-full bg-black/40 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-red-600 transition-all resize-none"
                         ></textarea>
                      </div>
                   </div>

                   <button 
                      type="submit" 
                      disabled={formStatus === 'submitting' || formStatus === 'success'}
                      className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-95
                         ${formStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-lg'}
                         ${formStatus === 'submitting' ? 'opacity-70 cursor-wait' : ''}
                      `}
                   >
                      {formStatus === 'idle' && <>Enviar Mensaje <ArrowRight size={18} /></>}
                      {formStatus === 'submitting' && <span className="animate-pulse">Transmitiendo...</span>}
                      {formStatus === 'success' && <>¡Recibido con éxito! <CheckCircle size={18} /></>}
                      {formStatus === 'error' && <>Error en el sistema <AlertTriangle size={18} /></>}
                   </button>
                </form>

                <AnimatePresence>
                   {formStatus === 'success' && (
                      <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="absolute inset-0 z-20 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
                      >
                         <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                            <CheckCircle size={32} />
                         </div>
                         <h4 className="text-white font-bold text-2xl mb-2 uppercase tracking-tighter">¡Mensaje Recibido!</h4>
                         <p className="text-zinc-500 text-sm">Me pondré en contacto contigo lo antes posible.</p>
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