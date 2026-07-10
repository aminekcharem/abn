"use client";

import { useSyncExternalStore } from "react";

import {
  languageChangeEvent,
  languageStorageKey,
} from "./public-translation-provider";

type SiteLanguage = "fr" | "en";

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

export function PublicLanguageSwitch() {
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

  return (
    <div className="overflow-hidden rounded-md border border-white/25">
      <button
        aria-pressed={language === "fr"}
        className={`px-3 py-1.5 text-xs font-semibold transition ${
          language === "fr"
            ? "bg-[#f2a414] text-[#14181d]"
            : "text-white/65 hover:bg-white/10 hover:text-white"
        }`}
        onClick={() => changeLanguage("fr")}
        type="button"
      >
        FR
      </button>
      <button
        aria-pressed={language === "en"}
        className={`px-3 py-1.5 text-xs font-semibold transition ${
          language === "en"
            ? "bg-[#f2a414] text-[#14181d]"
            : "text-white/65 hover:bg-white/10 hover:text-white"
        }`}
        onClick={() => changeLanguage("en")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
