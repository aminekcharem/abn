import { Car, CircleDollarSign, Eye, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Vehicules publies", value: "42", icon: Car },
  { label: "Leads ce mois", value: "128", icon: Users },
  { label: "Vues showroom", value: "18.4k", icon: Eye },
  { label: "Valeur stock", value: "KRW 4.8B", icon: CircleDollarSign },
];

export default function AdminPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Tableau de bord
        </h2>
        <p className="mt-2 text-zinc-400">
          Vue generale du stock, des demandes et de la performance showroom.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card className="border-zinc-800 bg-zinc-900" key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <Icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle>Pipeline showroom</CardTitle>
          <CardDescription>
            Les prochains modules admin pourront connecter Prisma pour gerer le
            stock, les images et les demandes clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
            {["Importer un vehicule", "Publier une annonce", "Suivre un lead"].map(
              (item) => (
                <div className="rounded-lg border border-zinc-800 p-4" key={item}>
                  {item}
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
