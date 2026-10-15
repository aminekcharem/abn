"use client";

import { useState } from "react";
import { Grid2X2 } from "lucide-react";

import { CategoryForm } from "./category-form";
import { Button } from "@/components/ui/button";

export function CategoriesActionsPanel({ nextOrder }: { nextOrder: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          className={
            isOpen
              ? "bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
              : "border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white"
          }
          onClick={() => setIsOpen((value) => !value)}
          type="button"
          variant={isOpen ? "default" : "outline"}
        >
          <Grid2X2 className="h-4 w-4" />
          Ajouter une categorie
        </Button>
      </div>

      {isOpen ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
          <CategoryForm nextOrder={nextOrder} />
        </div>
      ) : null}
    </div>
  );
}

