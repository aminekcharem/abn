"use client";

import { Trash2 } from "lucide-react";

import { deleteMediaAsset } from "./actions";
import { Button } from "@/components/ui/button";

export function MediaDeleteForm({
  assetId,
  assetName,
}: {
  assetId: string;
  assetName: string;
}) {
  return (
    <form
      action={deleteMediaAsset}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Supprimer definitivement l'image "${assetName}" ?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={assetId} />
      <Button size="sm" type="submit" variant="destructive">
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>
    </form>
  );
}
