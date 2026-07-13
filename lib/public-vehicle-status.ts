export type PublicVehicleStatus = "BROUILLON" | "DISPONIBLE" | "RESERVE" | "VENDU";

const statusLabels: Record<PublicVehicleStatus, string> = {
  BROUILLON: "Brouillon",
  DISPONIBLE: "Disponible",
  RESERVE: "Réservé",
  VENDU: "Vendu",
};

const statusColorClasses: Record<PublicVehicleStatus, string> = {
  BROUILLON: "bg-[#5b6470]",
  DISPONIBLE: "bg-[#1f7a3d]",
  RESERVE: "bg-[#f2a414]",
  VENDU: "bg-[#d92d20]",
};

export function getVehicleStatusLabel(status: PublicVehicleStatus) {
  return statusLabels[status];
}

export function getVehicleStatusBadgeClassName(status: PublicVehicleStatus) {
  return [
    "inline-flex items-center rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white",
    statusColorClasses[status],
  ].join(" ");
}
