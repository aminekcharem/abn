"use client";

import { useEffect, useMemo } from "react";

import type { PublicTranslationEntry } from "@/lib/translations";

const languageStorageKey = "autopro-language";
const languageChangeEvent = "autopro-language-change";

type PublicTranslationProviderProps = {
  children: React.ReactNode;
  translations: PublicTranslationEntry[];
};

type SiteLanguage = "fr" | "en";

function getInitialLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem(languageStorageKey) === "en" ? "en" : "fr";
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function withOriginalSpacing(current: string, replacement: string) {
  const leading = current.match(/^\s*/)?.[0] ?? "";
  const trailing = current.match(/\s*$/)?.[0] ?? "";

  return `${leading}${replacement}${trailing}`;
}

export function PublicTranslationProvider({
  children,
  translations,
}: PublicTranslationProviderProps) {
  const dictionary = useMemo(() => {
    return new Map(
      translations.map((entry) => [
        normalizeText(entry.sourceText),
        entry.targetText.trim(),
      ]),
    );
  }, [translations]);

  useEffect(() => {
    const originals = new WeakMap<Text, string>();

    function translateTextNode(node: Text, language: SiteLanguage) {
      const original = originals.get(node) ?? node.nodeValue ?? "";

      if (!originals.has(node)) {
        originals.set(node, original);
      }

      if (language === "fr") {
        node.nodeValue = original;
        return;
      }

      const translated = dictionary.get(normalizeText(original));

      if (translated) {
        node.nodeValue = withOriginalSpacing(original, translated);
      }
    }

    function translateAttributes(element: Element, language: SiteLanguage) {
      ["aria-label", "placeholder", "title", "alt"].forEach((attribute) => {
        const originalAttribute = `data-translation-original-${attribute}`;
        const original =
          element.getAttribute(originalAttribute) ?? element.getAttribute(attribute);

        if (!original) return;

        if (!element.hasAttribute(originalAttribute)) {
          element.setAttribute(originalAttribute, original);
        }

        if (language === "fr") {
          element.setAttribute(attribute, original);
          return;
        }

        const translated = dictionary.get(normalizeText(original));

        if (translated) {
          element.setAttribute(attribute, translated);
        }
      });
    }

    function applyLanguage(language: SiteLanguage) {
      document.documentElement.lang = language;
      document.documentElement.dataset.language = language;

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        translateTextNode(node as Text, language);
        node = walker.nextNode();
      }

      document.body.querySelectorAll("*").forEach((element) => {
        translateAttributes(element, language);
      });
    }

    let currentLanguage = getInitialLanguage();
    applyLanguage(currentLanguage);

    const observer = new MutationObserver(() => {
      applyLanguage(currentLanguage);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    function handleLanguageChange(event: Event) {
      const detail = (event as CustomEvent<{ language?: SiteLanguage }>).detail;
      currentLanguage = detail?.language === "en" ? "en" : "fr";
      window.localStorage.setItem(languageStorageKey, currentLanguage);
      applyLanguage(currentLanguage);
    }

    window.addEventListener(languageChangeEvent, handleLanguageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener(languageChangeEvent, handleLanguageChange);
    };
  }, [dictionary]);

  return <>{children}</>;
}

export { languageChangeEvent, languageStorageKey };
