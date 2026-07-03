import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-zinc-400">
        Les statistiques de consultation et conversion seront affichees ici.
      </CardContent>
    </Card>
  );
}
