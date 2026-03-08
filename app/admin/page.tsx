"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  Key,
  ArrowRight,
  ShieldAlert,
  TerminalSquare,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { CURRENT_SLUG } from "@/context/AdminContext";
// ✅ Importamos el bloqueador
import AdminMobileBlocker from "@/components/AdminMobileBlocker";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // ✅ Estado para el bloqueo de móvil
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  // 1. Comprobar si la web está en modo mantenimiento y detectar tamaño de pantalla
  useEffect(() => {
    const checkSystem = async () => {
      // Detección de móvil (bloqueamos por debajo de 1024px)
      const handleResize = () => setIsMobile(window.innerWidth < 1024);
      handleResize();
      window.addEventListener("resize", handleResize);

      try {
        const slug = CURRENT_SLUG || "danirayo";
        const { data } = await supabase
          .from("portfolio_content")
          .select("description")
          .eq("client_slug", slug)
          .eq("section_id", "maintenance")
          .maybeSingle();

        if (data && data.description === "true") {
          setIsMaintenance(true);
        }
      } catch (e) {
        console.error("No se pudo comprobar el estado del sistema", e);
      }

      return () => window.removeEventListener("resize", handleResize);
    };
    checkSystem();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Access denied: Invalid credentials or system locked.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  // ✅ RENDER DE SEGURIDAD PARA MÓVILES
  if (isMobile) return <AdminMobileBlocker />;

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden font-mono">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none z-[-1]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative flex flex-col items-center"
      >
        <div className="flex items-center gap-4 mb-6 justify-center w-full">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-red-600"></div>
          <span className="text-red-500 font-bold text-xs tracking-[0.3em] uppercase flex items-center gap-2 animate-pulse">
            <TerminalSquare size={14} />
            SECURE_GATEWAY
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-red-600"></div>
        </div>

        <AnimatePresence>
          {isMaintenance && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              className="w-full mb-6 bg-red-950/40 border border-red-500/50 p-4 rounded-sm flex items-center gap-4 shadow-[0_0_20px_rgba(220,38,38,0.2)] backdrop-blur-md overflow-hidden"
            >
              <div className="text-red-500 animate-pulse shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-red-500 font-bold text-xs tracking-widest uppercase mb-1">
                  Maintenance Active
                </h3>
                <p className="text-neutral-400 text-[10px] leading-relaxed">
                  The public frontend is currently locked. Login to access the
                  system override controls.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full bg-black/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden group/card">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity duration-500" />

          <div className="text-center mb-10 flex flex-col items-center">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            >
              <Lock size={40} strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-[0.2em] drop-shadow-md">
              ADMIN <span className="text-red-600">ACCESS</span>
            </h1>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-4 pl-10 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 focus:bg-red-950/10 transition-all rounded-sm text-sm tracking-wider"
                placeholder="Identity"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Key size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-4 pl-10 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 focus:bg-red-950/10 transition-all rounded-sm text-sm tracking-wider"
                placeholder="Credentials"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-red-500 transition-colors focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-sm text-xs">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              className="mt-4 relative group/btn w-full py-4 bg-black border border-white/10 hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all duration-500 rounded-sm"
            >
              {!loading && (
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
              )}

              <span className="relative z-10 text-white font-bold text-sm tracking-[0.2em] flex items-center justify-center gap-3">
                {loading ? (
                  <span className="animate-pulse">DECRYPTING_DATA...</span>
                ) : (
                  <>
                    AUTHORIZE{" "}
                    <ArrowRight
                      size={16}
                      className="text-red-500 group-hover:text-white transition-colors"
                    />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
