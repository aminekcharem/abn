import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMessagesPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-zinc-400">
        Les messages de contact non lus et archives seront affiches ici.
      </CardContent>
    </Card>
  );
}
