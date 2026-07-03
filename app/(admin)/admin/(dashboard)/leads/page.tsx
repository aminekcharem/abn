import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLeadsPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle>Demandes clients</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-zinc-400">
        Les leads du showroom seront affiches ici.
      </CardContent>
    </Card>
  );
}
