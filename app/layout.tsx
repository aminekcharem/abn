import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: "400",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: "700",
});

export const metadata: Metadata = {
  title: "Abn Motors - Showroom automobile premium à Caméroun",
  description:
    "Découvrez Abn Motors, votre showroom automobile premium à Caméroun. Explorez notre sélection de véhicules de luxe et profitez d'une expérience d'achat exceptionnelle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
