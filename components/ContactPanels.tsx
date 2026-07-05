import { useState } from "react";
import { Html } from "@react-three/drei";
import { Mail, Send, CheckCircle, Copy, AlertTriangle } from "lucide-react";

export default function ContactPanels() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzwzpre";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormStatus("success");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setFormStatus("idle"), 5000);
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("drayo3d.contact@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const renderLeftPanel = () => {
    return (
      <div
        className="w-[485px] bg-zinc-950/90 border border-red-500/20 backdrop-blur-xl rounded-2xl p-10 select-none font-mono flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative animate-fade-in text-white"
        style={{
          boxShadow: `0 0 40px rgba(255, 51, 102, 0.08), inset 0 0 20px rgba(255, 51, 102, 0.04)`,
          borderColor: "rgba(255, 51, 102, 0.25)",
        }}
      >
        {/* Cyber Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg border-red-500/80" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg border-red-500/80" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg border-red-500/80" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg border-red-500/80" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
          <Mail size={18} className="text-red-500" />
          <span className="text-white text-sm font-black uppercase tracking-[0.25em]">Communications</span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <h3 className="text-4xl font-black leading-tight tracking-tight uppercase">
            LET'S DISCUSS <br />
            <span className="text-white/20">YOUR PROJECT.</span>
          </h3>
          <p className="text-zinc-400 text-[13px] leading-relaxed max-w-sm font-light">
            Do you have an idea in mind? I am available for freelance collaborations and new challenges in the 3D industry.
          </p>
        </div>

        {/* Copy Box */}
        <div className="group relative bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md hover:border-red-600/50 transition-all duration-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 truncate">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:border-red-500 group-hover:text-white transition-colors duration-300">
              <Mail size={16} />
            </div>
            <div className="truncate">
              <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Email</div>
              <div className="text-sm text-white font-medium select-text truncate">drayo3d.contact@gmail.com</div>
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copiar email"
          >
            {copiedEmail ? (
              <CheckCircle size={18} className="text-green-500 animate-pulse" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderRightPanel = () => {
    return (
      <div
        className="w-[485px] bg-zinc-950/90 border border-red-500/20 backdrop-blur-xl rounded-2xl p-10 select-none font-mono flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative animate-fade-in text-white"
        style={{
          boxShadow: `0 0 40px rgba(255, 51, 102, 0.08), inset 0 0 20px rgba(255, 51, 102, 0.04)`,
          borderColor: "rgba(255, 51, 102, 0.25)",
        }}
      >
        {/* Cyber Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg border-red-500/80" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg border-red-500/80" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg border-red-500/80" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg border-red-500/80" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
          <Send size={18} className="text-red-500" />
          <span className="text-white text-sm font-black uppercase tracking-[0.25em]">Send Message</span>
        </div>

        {formStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-fade-in">
            <CheckCircle size={48} className="text-green-500" />
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">Message Sent</h4>
              <p className="text-zinc-400 text-[10px] leading-relaxed max-w-[280px]">
                Your message has been sent successfully. I will get back to you as soon as possible.
              </p>
            </div>
          </div>
        ) : formStatus === "error" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-fade-in">
            <AlertTriangle size={48} className="text-red-500" />
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">Send Failed</h4>
              <p className="text-zinc-400 text-[10px] leading-relaxed max-w-[280px]">
                Could not send message. Please check your connection and try again.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 select-text">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Name</label>
              <input
                required
                type="text"
                name="name"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono focus:ring-1 focus:ring-red-500/40"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Email</label>
              <input
                required
                type="email"
                name="email"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono focus:ring-1 focus:ring-red-500/40"
                placeholder="your-email@example.com"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Message</label>
              <textarea
                required
                name="message"
                rows={3}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-red-500 focus:outline-none transition-colors font-mono resize-none focus:ring-1 focus:ring-red-500/40"
                placeholder="Write your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={formStatus === "submitting"}
              className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest py-4 text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2 uppercase cursor-pointer"
            >
              {formStatus === "submitting" ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <group>
      {/* Panel Izquierdo: Info & Email */}
      <Html position={[-2.65, 0, 0]} center distanceFactor={5.6}>
        {renderLeftPanel()}
      </Html>

      {/* Panel Derecho: Formulario */}
      <Html position={[2.65, 0, 0]} center distanceFactor={5.6}>
        {renderRightPanel()}
      </Html>
    </group>
  );
}
