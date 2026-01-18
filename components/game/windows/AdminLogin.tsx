"use client";

import React, { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Lock, Unlock, Loader2, Send, Terminal, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const { user, signIn, signOut, isLoading } = useAdmin();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await signIn(email); // Usa la función del contexto
      setStatus('sent');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  // --- VISTA 1: YA ESTÁS DENTRO (ADMIN) ---
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse" />
          <div className="w-24 h-24 bg-black/40 border-4 border-green-500 rounded-full flex items-center justify-center relative z-10">
             <Unlock size={40} className="text-green-500" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic text-green-400 tracking-wider">ACCESO CONCEDIDO</h2>
          <p className="font-mono text-green-600/80">ID: {user.email}</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg max-w-md text-center">
          <p className="text-green-300 font-mono text-sm">
            MODO DIOS ACTIVADO. <br/>
            Ahora puedes editar proyectos y skills directamente desde la base de datos.
          </p>
        </div>

        <button 
          onClick={() => signOut()}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded hover:scale-105 transition-all flex items-center gap-2"
        >
          CERRAR SESIÓN
        </button>
      </div>
    );
  }

  // --- VISTA 2: FORMULARIO DE ACCESO ---
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
      
      {/* Icono de Candado */}
      <div className="mb-8 relative group">
         <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
         <ShieldAlert size={80} className="text-red-500 relative z-10" />
      </div>

      <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">ZONA RESTRINGIDA</h2>
      <p className="text-gray-400 font-mono text-sm mb-8 text-center">
        Este terminal es solo para el Desarrollador. <br/>
        Si eres un visitante, por favor regresa al mapa.
      </p>

      {status === 'sent' ? (
        <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-6 rounded-xl text-center animate-in zoom-in">
           <Send size={40} className="mx-auto mb-4 text-blue-400" />
           <h3 className="text-xl font-bold mb-2">ENLACE ENVIADO</h3>
           <p>Revisa tu correo electrónico <strong>{email}</strong> para acceder.</p>
           <button onClick={() => setStatus('idle')} className="mt-4 text-xs hover:underline text-blue-400">Intentar de nuevo</button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
               <Terminal size={20} />
            </div>
            <input 
              type="email" 
              placeholder="admin@danirayo.es"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/10 focus:border-yellow-400 text-white pl-12 pr-4 py-4 rounded-lg outline-none font-mono transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-white text-black font-black py-4 rounded-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === 'loading' ? (
              <><Loader2 className="animate-spin" /> DESENCRIPTANDO...</>
            ) : (
              <>AUTENTICAR <Lock size={18} /></>
            )}
          </button>
          
          {status === 'error' && (
             <p className="text-red-500 text-center font-mono text-sm mt-2">Error de conexión. Inténtalo de nuevo.</p>
          )}
        </form>
      )}
    </div>
  );
}