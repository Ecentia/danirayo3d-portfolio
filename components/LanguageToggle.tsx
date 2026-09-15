"use client";

import { Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "es" | "en";

const LANGS: readonly Lang[] = ["es", "en"];

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={`flex items-center gap-2 text-[13px] ${className}`}
    >
      {LANGS.map((lang, index) => {
        const active = language === lang;
        return (
          <Fragment key={lang}>
            {index > 0 && (
              <span aria-hidden className="text-white/20">
                /
              </span>
            )}
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setLanguage(lang)}
              className={`cursor-pointer uppercase transition-colors duration-300 ${
                active ? "text-white" : "text-white/40 hover:text-white/80"
              }`}
            >
              {lang}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
