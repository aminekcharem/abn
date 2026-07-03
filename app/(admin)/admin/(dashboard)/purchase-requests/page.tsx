import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPurchaseRequestsPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle>Demandes d&apos;achat</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-zinc-400">
        Les demandes d&apos;achat et financements en attente seront affiches ici.
      </CardContent>
    </Card>
  );
}
