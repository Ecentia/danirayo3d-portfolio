"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Lock,
  Mail,
  ShieldAlert,
  TerminalSquare,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Save,
  Server,
  RefreshCw,
  Power,
} from "lucide-react";
import Link from "next/link";
import { CURRENT_SLUG } from "@/context/AdminContext";

export default function AdminSettings() {
  const router = useRouter();

  // ✅ ESTADO CRÍTICO: Bloquea el renderizado hasta confirmar la sesión
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  // Estados para el usuario actual
  const [currentEmail, setCurrentEmail] = useState<string>("Cargando...");

  // Estados de los formularios de autenticación
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados de carga de botones
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados para los switches del sistema (UI)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Estado para mensajes de feedback
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Verificar sesión y cargar estado de mantenimiento al montar
  useEffect(() => {
    const initSettings = async () => {
      // 1. Verificar sesión inmediatamente
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Si no hay sesión, redirigimos y NO quitamos el estado isAuthorizing
        router.push("/admin");
        return;
      }

      setCurrentEmail(session.user.email || "Desconocido");

      // 2. Cargar estado de mantenimiento desde la base de datos de forma segura
      try {
        const slug = CURRENT_SLUG || "danirayo";
        const { data: maintenanceData } = await supabase
          .from("portfolio_content")
          .select("description")
          .eq("client_slug", slug)
          .eq("section_id", "maintenance")
          .maybeSingle();

        if (maintenanceData && maintenanceData.description === "true") {
          setMaintenanceMode(true);
        }
      } catch (e) {
        console.error("Error cargando estado de mantenimiento", e);
      } finally {
        // ✅ Solo permitimos el renderizado una vez validado todo
        setIsAuthorizing(false);
      }
    };
    initSettings();
  }, [router]);

  // Mostrar mensaje temporal
  const showNotification = (
    text: string,
    type: "success" | "error" | "info",
  ) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // 1. Actualizar Email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      showNotification(`Error: ${error.message}`, "error");
    } else {
      showNotification(
        "Identidad actualizada en el núcleo de Supabase.",
        "success",
      );
      setCurrentEmail(newEmail);
      setNewEmail("");
    }
    setLoadingEmail(false);
  };

  // 2. Actualizar Contraseña
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPass(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showNotification(`Error: ${error.message}`, "error");
    } else {
      showNotification(
        "Credenciales de encriptación actualizadas con éxito.",
        "success",
      );
      setNewPassword("");
    }
    setLoadingPass(false);
  };

  // 3. Forzar sincronización de datos
  const handleForceSync = () => {
    setIsSyncing(true);
    showNotification("Iniciando sincronización forzada del núcleo...", "info");
    setTimeout(() => {
      router.refresh();
      setIsSyncing(false);
      showNotification("Sincronización de datos completada.", "success");
    }, 1500);
  };

  // 4. Activar / Desactivar Modo Mantenimiento
  const toggleMaintenance = async () => {
    const newState = !maintenanceMode;
    setMaintenanceMode(newState);
    try {
      const slug = CURRENT_SLUG || "danirayo";
      const { error } = await supabase.from("portfolio_content").upsert(
        {
          client_slug: slug,
          section_id: "maintenance",
          description: newState ? "true" : "false",
          title: "System Maintenance",
        },
        { onConflict: "client_slug, section_id" },
      );
      if (error) throw error;
      showNotification(
        newState ? "LOCK ACTIVADO" : "LOCK DESACTIVADO",
        newState ? "success" : "info",
      );
    } catch (error: any) {
      showNotification(`Error de conexión: ${error.message}`, "error");
      setMaintenanceMode(!newState);
    }
  };

  // ✅ RENDER DE SEGURIDAD: Pantalla de carga mientras se verifica el acceso
  if (isAuthorizing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-red-600 font-mono text-xs tracking-[0.5em] uppercase"
        >
          AUTHENTICATING_ACCESS...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden font-mono">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-[-1]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl relative"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors mb-6 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-xs tracking-widest uppercase">
            Return to Core
          </span>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-600"></div>
          <span className="text-red-500 font-bold text-xs tracking-[0.3em] uppercase flex items-center gap-2 animate-pulse">
            <Settings size={14} />
            SECURITY_PROTOCOLS
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-red-600"></div>
        </div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className={`mb-6 p-4 rounded-sm border backdrop-blur-md flex items-center gap-3 text-sm overflow-hidden
                ${message.type === "error" ? "bg-red-950/30 border-red-900/50 text-red-400" : ""}
                ${message.type === "success" ? "bg-green-950/30 border-green-900/50 text-green-400" : ""}
                ${message.type === "info" ? "bg-cyan-950/30 border-cyan-900/50 text-cyan-400" : ""}
              `}
            >
              {message.type === "error" && (
                <ShieldAlert size={18} className="shrink-0" />
              )}
              {message.type === "success" && (
                <CheckCircle size={18} className="shrink-0" />
              )}
              {message.type === "info" && (
                <TerminalSquare size={18} className="shrink-0 animate-pulse" />
              )}
              <p>{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PANEL 1: EMAIL */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group/card flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity duration-500" />
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-red-500" size={24} strokeWidth={1.5} />
                <h2 className="text-white font-bold tracking-widest uppercase text-sm">
                  Update Identity
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mb-6">
                Current ID:{" "}
                <span className="text-neutral-300">{currentEmail}</span>
              </p>
            </div>
            <form
              onSubmit={handleUpdateEmail}
              className="flex flex-col gap-4 mt-auto"
            >
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-3 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 focus:bg-red-950/10 transition-all rounded-sm text-sm tracking-wider"
                placeholder="New Email Address"
                required
              />
              <button
                disabled={loadingEmail}
                className="relative group/btn w-full py-3 bg-black border border-white/10 hover:border-red-600 disabled:opacity-50 overflow-hidden transition-all duration-500 rounded-sm"
              >
                {!loadingEmail && (
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                )}
                <span className="relative z-10 text-white font-bold text-xs tracking-[0.2em] flex items-center justify-center gap-2">
                  {loadingEmail ? (
                    "PROCESSING..."
                  ) : (
                    <>
                      <Save
                        size={14}
                        className="text-red-500 group-hover/btn:text-white"
                      />{" "}
                      OVERWRITE ID
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* PANEL 2: PASSWORD */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group/card flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity duration-500" />
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-red-500" size={24} strokeWidth={1.5} />
                <h2 className="text-white font-bold tracking-widest uppercase text-sm">
                  Update Credentials
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mb-6">
                Establish a new secure encryption key. Minimum 6 characters.
              </p>
            </div>
            <form
              onSubmit={handleUpdatePassword}
              className="flex flex-col gap-4 mt-auto"
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-black/50 border border-white/10 p-3 pr-10 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 focus:bg-red-950/10 transition-all rounded-sm text-sm tracking-wider"
                  placeholder="New Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-red-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                disabled={loadingPass}
                className="relative group/btn w-full py-3 bg-black border border-white/10 hover:border-red-600 disabled:opacity-50 overflow-hidden transition-all duration-500 rounded-sm"
              >
                {!loadingPass && (
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                )}
                <span className="relative z-10 text-white font-bold text-xs tracking-[0.2em] flex items-center justify-center gap-2">
                  {loadingPass ? (
                    "ENCRYPTING..."
                  ) : (
                    <>
                      <Save
                        size={14}
                        className="text-red-500 group-hover/btn:text-white"
                      />{" "}
                      OVERWRITE KEY
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* PANEL 3: SYSTEM OVERRIDES */}
          <div className="md:col-span-2 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group/card mt-2">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50 group-hover/card:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 mb-6">
              <Server className="text-red-500" size={24} strokeWidth={1.5} />
              <h2 className="text-white font-bold tracking-widest uppercase text-sm">
                System Overrides
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-sm border border-white/5">
                <div>
                  <h3 className="text-white text-xs font-bold tracking-widest mb-1">
                    DATA SYNC
                  </h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed">
                    Forces Next.js to purge cache and fetch latest Supabase
                    data.
                  </p>
                </div>
                <button
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-black hover:bg-neutral-900 border border-white/10 hover:border-red-500 text-white text-xs tracking-widest transition-all rounded-sm disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={
                      isSyncing
                        ? "animate-spin text-red-500"
                        : "text-neutral-400"
                    }
                  />
                  {isSyncing ? "SYNCING..." : "FORCE REFRESH"}
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-sm border border-white/5">
                <div>
                  <h3 className="text-white text-xs font-bold tracking-widest mb-1 flex items-center justify-between">
                    MAINTENANCE
                    <span
                      className={`px-2 py-0.5 text-[9px] rounded-sm ${maintenanceMode ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
                    >
                      {maintenanceMode ? "ACTIVE" : "OFFLINE"}
                    </span>
                  </h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed">
                    Locks the public frontend. Only admins can enter.
                  </p>
                </div>
                <button
                  onClick={toggleMaintenance}
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-2 border transition-all rounded-sm text-xs tracking-widest
                    ${maintenanceMode ? "bg-red-950/30 border-red-900 text-red-400 hover:bg-red-900/50" : "bg-black hover:bg-neutral-900 border-white/10 text-white"}
                  `}
                >
                  <Power size={12} />
                  {maintenanceMode ? "DISABLE LOCK" : "ENABLE LOCK"}
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-sm border border-white/5">
                <div>
                  <h3 className="text-white text-xs font-bold tracking-widest mb-1 flex items-center justify-between">
                    DEBUG_MODE
                    <span
                      className={`px-2 py-0.5 text-[9px] rounded-sm ${debugMode ? "bg-cyan-500/20 text-cyan-400" : "bg-neutral-500/20 text-neutral-400"}`}
                    >
                      {debugMode ? "ACTIVE" : "OFFLINE"}
                    </span>
                  </h3>
                  <p className="text-neutral-500 text-[10px] leading-relaxed">
                    Reveals system logs and performance metrics.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDebugMode(!debugMode);
                    showNotification(
                      debugMode ? "Debug mode disabled." : "Debug mode active.",
                      "info",
                    );
                  }}
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-2 border transition-all rounded-sm text-xs tracking-widest
                    ${debugMode ? "bg-cyan-950/30 border-cyan-900 text-cyan-400 hover:bg-cyan-900/50" : "bg-black hover:bg-neutral-900 border-white/10 text-white"}
                  `}
                >
                  <Settings size={12} />
                  {debugMode ? "DEACTIVATE" : "ACTIVATE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
