'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('ERROR: ' + error.message);
      setLoading(false);
    } else {
      // Login exitoso: Redirigimos a la home y refrescamos para actualizar el estado global
      router.push('/'); 
      router.refresh(); 
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center font-mono">
      <div className="w-full max-w-md p-8 border border-cyan-900 bg-cyan-950/10 backdrop-blur-md rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.1)]">
        <h1 className="text-3xl text-cyan-500 font-bold mb-8 text-center tracking-widest">
          ADMIN ACCESS
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border border-cyan-800 p-3 text-white placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all rounded"
              placeholder="Identity"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border border-cyan-800 p-3 text-white placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all rounded"
              placeholder="Credentials"
              required
            />
          </div>
          <button 
            disabled={loading}
            className="mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 disabled:cursor-not-allowed text-white font-bold py-3 uppercase tracking-widest transition-all rounded shadow-lg hover:shadow-cyan-500/20"
          >
            {loading ? 'Decrypting...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}