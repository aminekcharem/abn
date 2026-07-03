"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import type { HomepageFaqItem } from "@/lib/homepage-settings";

type HomeFaqAccordionProps = {
  items: HomepageFaqItem[];
};

export function HomeFaqAccordion({ items }: HomeFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    items.length ? 0 : null,
  );

  return (
    <div className="mt-16 grid gap-1">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `home-faq-panel-${index}`;
        const triggerId = `home-faq-trigger-${index}`;

        return (
          <article
            className={
              isOpen
                ? "border-b border-transparent bg-[#f7f8fa] transition-colors duration-300"
                : "border-b border-transparent transition-colors duration-300"
            }
            key={`${item.question}-${index}`}
          >
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-6 px-0 py-6 text-left text-base font-semibold text-[#050b20] sm:px-10 sm:text-lg"
              id={triggerId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span>{item.question}</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center text-[#050b20]">
                {isOpen ? (
                  <Minus className="h-5 w-5 transition-transform duration-300" />
                ) : (
                  <Plus className="h-5 w-5 transition-transform duration-300" />
                )}
              </span>
            </button>
            <div
              className={
                isOpen
                  ? "grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-out"
                  : "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out"
              }
            >
              <div
                aria-labelledby={triggerId}
                aria-hidden={!isOpen}
                className={
                  isOpen
                    ? "min-h-0 overflow-hidden px-0 pb-8 text-sm leading-8 text-[#050b20]/78 transition-[padding] duration-300 sm:px-10"
                    : "min-h-0 overflow-hidden px-0 pb-0 text-sm leading-8 text-[#050b20]/78 transition-[padding] duration-300 sm:px-10"
                }
                id={panelId}
                role="region"
              >
                {item.answer}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
