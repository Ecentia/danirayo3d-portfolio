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

    console.log("Intentando login con:", email, password);
    console.log("URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('ERROR: ' + error.message);
    } else {
      router.push('/'); // Te manda al inicio en modo editor
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center font-mono">
      <div className="w-full max-w-md p-8 border border-cyan-900 bg-cyan-950/10 backdrop-blur-md rounded-lg">
        <h1 className="text-3xl text-cyan-500 font-bold mb-8 text-center tracking-widest">
          ADMIN ACCESS
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border border-cyan-800 p-3 text-white focus:outline-none focus:border-cyan-400"
            placeholder="Identity"
          />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/50 border border-cyan-800 p-3 text-white focus:outline-none focus:border-cyan-400"
            placeholder="Credentials"
          />
          <button 
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 uppercase tracking-widest transition-all"
          >
            {loading ? 'Decrypting...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}