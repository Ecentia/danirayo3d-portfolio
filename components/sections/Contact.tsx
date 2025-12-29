'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Send, CheckCircle, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
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
    <section className="relative w-full py-24 lg:py-32 bg-[#050505] overflow-hidden border-t border-white/5">
      
      {/* FONDO "ALGO GUAPO": AURORA ROJA ANIMADA */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Mancha roja suave que se mueve */}
         <motion.div 
            animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.3, 0.5, 0.3],
               rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-red-600/10 blur-[120px] rounded-full"
         />
         <motion.div 
            animate={{ 
               scale: [1, 1.1, 1],
               opacity: [0.2, 0.4, 0.2],
               x: [0, -50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-red-900/10 blur-[100px] rounded-full"
         />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* --- COLUMNA IZQUIERDA: TEXTO E INFO --- */}
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
                 ¿Tienes una idea en mente? Estoy disponible para colaboraciones freelance y nuevos retos en 3D.
              </p>
            </div>

            <div className="space-y-6">
               {/* Tarjeta Email con copiar */}
               <div className="group relative bg-zinc-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-900 rounded-full text-white border border-white/10 group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                        <Mail size={20} />
                     </div>
                     <div className="flex-1">
                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Email</div>
                        <div className="text-lg text-white font-medium">danielrayo247@gmail.com</div>
                     </div>
                     <button 
                        onClick={copyToClipboard}
                        className="p-2 text-zinc-500 hover:text-white transition-colors relative"
                        title="Copiar email"
                     >
                        {copiedEmail ? <CheckCircle size={20} className="text-green-500"/> : <Copy size={20}/>}
                     </button>
                  </div>
               </div>

            </div>

            {/* Redes Sociales */}
            <div className="flex gap-4 pt-4">
               <a href="https://www.artstation.com/d_rayo3d/" target="_blank" className="flex items-center gap-2 px-6 py-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-black border border-zinc-800 hover:border-zinc-600 transition-all">
                  <SiArtstation size={18}/> <span className="font-bold text-sm">ArtStation</span>
               </a>
               <a href="https://www.instagram.com/d_rayo.3d/" target="_blank" className="flex items-center gap-2 px-6 py-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-black border border-zinc-800 hover:border-zinc-600 transition-all">
                  <SiInstagram size={18}/> <span className="font-bold text-sm">Instagram</span>
               </a>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: FORMULARIO LIMPIO --- */}
          <div className="relative">
             <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                
                {/* Brillo superior en el borde */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                   <div className="space-y-6">
                      <div className="group">
                         <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1 group-focus-within:text-white transition-colors">Nombre</label>
                         <input 
                            type="text" name="name" required placeholder="Tu nombre"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-red-500 focus:bg-black transition-all"
                         />
                      </div>

                      <div className="group">
                         <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1 group-focus-within:text-white transition-colors">Email</label>
                         <input 
                            type="email" name="email" required placeholder="ejemplo@correo.com"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-red-500 focus:bg-black transition-all"
                         />
                      </div>

                      <div className="group">
                         <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1 group-focus-within:text-white transition-colors">Mensaje</label>
                         <textarea 
                            name="message" required rows={4} placeholder="Cuéntame sobre tu proyecto..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder-zinc-700 outline-none focus:border-red-500 focus:bg-black transition-all resize-none"
                         ></textarea>
                      </div>
                   </div>

                   <button 
                      type="submit" 
                      disabled={formStatus === 'submitting' || formStatus === 'success'}
                      className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-95
                         ${formStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-lg hover:shadow-red-900/20'}
                         ${formStatus === 'submitting' ? 'opacity-70 cursor-wait' : ''}
                      `}
                   >
                      {formStatus === 'idle' && <>Enviar Mensaje <ArrowRight size={18} /></>}
                      {formStatus === 'submitting' && <span className="animate-pulse">Enviando...</span>}
                      {formStatus === 'success' && <>¡Mensaje Enviado! <CheckCircle size={18} /></>}
                      {formStatus === 'error' && <>Error - Reintentar <AlertTriangle size={18} /></>}
                   </button>
                </form>

                {/* Notificación de éxito superpuesta bonita */}
                <AnimatePresence>
                   {formStatus === 'success' && (
                      <motion.div 
                         initial={{ opacity: 0, scale: 0.95 }} 
                         animate={{ opacity: 1, scale: 1 }} 
                         exit={{ opacity: 0 }}
                         className="absolute inset-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
                      >
                         <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20"
                         >
                            <CheckCircle size={40} />
                         </motion.div>
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