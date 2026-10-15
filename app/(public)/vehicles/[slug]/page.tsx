import { redirect } from "next/navigation";

type VehicleRedirectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VehicleRedirectPage({ params }: VehicleRedirectPageProps) {
  const { slug } = await params;

  redirect(`/vehicules/${slug}`);
}
