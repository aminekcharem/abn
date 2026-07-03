"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > 320);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      aria-label="Retour en haut de page"
      className={`fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#ffc10a] text-[#1b1b1b] shadow-xl shadow-[#1b1b1b]/20 ring-1 ring-[#1b1b1b]/10 transition duration-300 hover:-translate-y-1 hover:bg-[#ffd44a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffc10a]/35 sm:bottom-7 sm:right-7 ${
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      onClick={scrollToTop}
      type="button"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
