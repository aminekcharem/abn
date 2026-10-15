"use client";

import { Languages } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  languageChangeEvent,
  languageStorageKey,
} from "./public-translation-provider";

type SiteLanguage = "fr" | "en";

type PublicLanguageSwitchProps = {
  variant?: "dark" | "light";
};

function getStoredLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem(languageStorageKey) === "en" ? "en" : "fr";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener(languageChangeEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(languageChangeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function PublicLanguageSwitch({ variant = "dark" }: PublicLanguageSwitchProps) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getStoredLanguage,
    () => "fr",
  );

  function changeLanguage(nextLanguage: SiteLanguage) {
    window.localStorage.setItem(languageStorageKey, nextLanguage);
    window.dispatchEvent(
      new CustomEvent(languageChangeEvent, {
        detail: { language: nextLanguage },
      }),
    );
  }

  const isLight = variant === "light";
  const frameClassName = isLight
    ? "border-[#ededed] bg-[#f7f7f5] text-[#24272c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
    : "border-white/20 bg-white/8 text-white";
  const inactiveClassName = isLight
    ? "text-[#696665] hover:bg-white hover:text-[#a21d2f]"
    : "text-white/65 hover:bg-white/10 hover:text-white";

  return (
    <div className={`inline-flex h-11 items-center gap-1 rounded-full border p-1 ${frameClassName}`}>
      <Languages className={`ml-2 h-4 w-4 shrink-0 ${isLight ? "text-[#a21d2f]" : "text-white/72"}`} />
      <button
        aria-pressed={language === "fr"}
        className={`h-8 min-w-9 rounded-full px-3 text-xs font-bold transition ${
          language === "fr"
            ? "bg-[#a21d2f] text-white shadow-[0_6px_14px_rgba(162,29,47,0.24)]"
            : inactiveClassName
        }`}
        onClick={() => changeLanguage("fr")}
        type="button"
      >
        FR
      </button>
      <button
        aria-pressed={language === "en"}
        className={`h-8 min-w-9 rounded-full px-3 text-xs font-bold transition ${
          language === "en"
            ? "bg-[#a21d2f] text-white shadow-[0_6px_14px_rgba(162,29,47,0.24)]"
            : inactiveClassName
        }`}
        onClick={() => changeLanguage("en")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}

