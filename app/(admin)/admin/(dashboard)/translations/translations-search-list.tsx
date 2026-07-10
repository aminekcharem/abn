"use client";

import { useEffect, useState } from "react";

type TranslationsSearchListProps = {
  children: React.ReactNode;
  count: number;
};

export function TranslationsSearchList({
  children,
  count,
}: TranslationsSearchListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>("[data-translation-row]"),
    );

    rows.forEach((row) => {
      const searchable = row.getAttribute("data-search")?.toLowerCase() ?? "";
      const visible = !normalizedQuery || searchable.includes(normalizedQuery);

      row.hidden = !visible;
    });
  }, [normalizedQuery]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center">
        <label className="grid flex-1 gap-2 text-sm font-medium text-zinc-200">
          Rechercher un mot
          <input
            className="h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition placeholder:text-zinc-600 focus:ring-4"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher en français ou en anglais..."
            value={query}
          />
        </label>
        <p className="text-sm text-zinc-400">
          {count} traduction(s)
        </p>
      </div>

      <div className="grid gap-4">{children}</div>
    </div>
  );
}
