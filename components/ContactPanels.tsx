import { useState } from "react";
import { Html } from "@react-three/drei";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";

const ACCENT = "#ff3366";
const CONTACT_EMAIL = "drayo3d.contact@gmail.com";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzwzpre";

// Fondo casi opaco en lugar de backdrop-blur: desenfocar el canvas WebGL que hay
// detrás obligaba al navegador a recalcular el blur en cada frame
const PANEL_CLASS =
  "animate-fade-in relative flex w-[485px] select-none flex-col gap-8 rounded-2xl border border-white/[0.08] bg-[#0b0b0c]/95 p-9 font-sans text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]";
const LABEL_CLASS = "mb-2 block text-[13px] text-white/45";
const INPUT_CLASS =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-white/25 transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.05] focus:outline-none";

export default function ContactPanels({ isSpanish }: { isSpanish: boolean }) {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setFormStatus("submitting");
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Formspree respondió ${response.status}`);
      }

      setFormStatus("success");
      form.reset();
      setTimeout(() => setFormStatus("idle"), 5000);
    } catch (error) {
      console.error("[Contacto] No se pudo enviar el formulario:", error);
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  const copyToClipboard = async () => {
    try {
      // navigator.clipboard no existe en contextos no seguros (http)
      if (!navigator.clipboard) throw new Error("Clipboard API no disponible");
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (error) {
      console.error("[Contacto] No se pudo copiar el correo:", error);
    }
  };

  const renderLeftPanel = () => {
    return (
      <div data-panel className={PANEL_CLASS}>
        <div className="flex flex-col gap-4">
          <h3 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em]">
            {isSpanish ? "¿Tienes un proyecto en mente?" : "Have a project in mind?"}
          </h3>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
            {isSpanish
              ? "Estoy disponible para trabajos freelance y colaboraciones en proyectos 3D. Escríbeme y lo hablamos."
              : "I'm available for freelance work and collaborations on 3D projects. Drop me a line and let's talk."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-6">
          <div className="min-w-0">
            <div className="mb-1 text-[13px] text-white/40">{isSpanish ? "Correo" : "Email"}</div>
            <div className="select-text truncate text-[15px] text-white">{CONTACT_EMAIL}</div>
          </div>
          <button
            onClick={copyToClipboard}
            className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[13px] text-white/60 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
          >
            {copiedEmail ? (isSpanish ? "Copiado" : "Copied") : isSpanish ? "Copiar" : "Copy"}
          </button>
        </div>
      </div>
    );
  };

  const renderStatus = (kind: "success" | "error") => {
    const isSuccess = kind === "success";
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center gap-4 py-16 text-center">
        {isSuccess ? (
          <CheckCircle size={36} strokeWidth={1.5} className="text-emerald-400" />
        ) : (
          <AlertTriangle size={36} strokeWidth={1.5} style={{ color: ACCENT }} />
        )}
        <div>
          <h4 className="mb-2 text-lg font-medium tracking-tight text-white">
            {isSuccess
              ? isSpanish ? "Mensaje enviado" : "Message sent"
              : isSpanish ? "No se pudo enviar" : "Couldn't send it"}
          </h4>
          <p className="max-w-[300px] text-sm leading-relaxed text-white/50">
            {isSuccess
              ? isSpanish
                ? "Gracias por escribirme. Te responderé lo antes posible."
                : "Thanks for reaching out. I'll get back to you as soon as I can."
              : isSpanish
                ? "Comprueba tu conexión e inténtalo de nuevo."
                : "Check your connection and try again."}
          </p>
        </div>
      </div>
    );
  };

  const renderRightPanel = () => {
    return (
      <div data-panel className={PANEL_CLASS}>
        <h3 className="text-lg font-medium tracking-tight">
          {isSpanish ? "Envíame un mensaje" : "Send me a message"}
        </h3>

        {formStatus === "success" || formStatus === "error" ? (
          renderStatus(formStatus)
        ) : (
          <form onSubmit={handleSubmit} className="flex select-text flex-col gap-4">
            <div>
              <label htmlFor="contact-name" className={LABEL_CLASS}>
                {isSpanish ? "Nombre" : "Name"}
              </label>
              <input
                id="contact-name"
                required
                type="text"
                name="name"
                autoComplete="name"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className={LABEL_CLASS}>
                {isSpanish ? "Correo" : "Email"}
              </label>
              <input
                id="contact-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className={LABEL_CLASS}>
                {isSpanish ? "Mensaje" : "Message"}
              </label>
              <textarea
                id="contact-message"
                required
                name="message"
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={formStatus === "submitting"}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[15px] font-medium text-black transition-[background-color,color,scale] duration-300 hover:bg-[#ff3366] hover:text-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {formStatus === "submitting" ? (
                <span>{isSpanish ? "Enviando..." : "Sending..."}</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>{isSpanish ? "Enviar" : "Send"}</span>
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
