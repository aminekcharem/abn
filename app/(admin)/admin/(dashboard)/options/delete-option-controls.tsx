"use client";

import { Trash2 } from "lucide-react";

import {
  deleteOptionAction,
  deleteOptionCategoryAction,
} from "./actions";
import { Button } from "@/components/ui/button";

export function DeleteOptionButton({
  optionId,
  optionName,
}: {
  optionId: string;
  optionName: string;
}) {
  return (
    <form
      action={deleteOptionAction}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer l'option "${optionName}" ?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={optionId} />
      <button
        className="grid h-5 w-5 place-items-center rounded-full text-zinc-500 transition hover:bg-[#a21d2f] hover:text-white"
        title="Supprimer l'option"
        type="submit"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </form>
  );
}

export function DeleteOptionCategoryButton({
  categoryId,
  categoryName,
  disabled,
}: {
  categoryId: string;
  categoryName: string;
  disabled: boolean;
}) {
  return (
    <form
      action={deleteOptionCategoryAction}
      onSubmit={(event) => {
        if (disabled) {
          event.preventDefault();
          window.alert(
            "Supprimez d'abord les options de cette categorie avant de supprimer la categorie.",
          );
          return;
        }

        if (
          !window.confirm(`Supprimer definitivement la categorie "${categoryName}" ?`)
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={categoryId} />
      <Button
        className="border-[#a21d2f]/40 bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
        size="sm"
        type="submit"
        variant="outline"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer categorie
      </Button>
    </form>
  );
}

