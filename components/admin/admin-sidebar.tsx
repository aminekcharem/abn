"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Car,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareText,
  Images,
  Home,
  Send,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  UserCog,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShowroomSettingsView } from "@/lib/settings";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
};

export function getAdminNavigation(counts: {
  pendingReviews: number;
  unreadMessages: number;
  pendingPurchaseRequests: number;
}): AdminNavItem[] {
  return [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Vehicules", href: "/admin/vehicles", icon: Car },
    { label: "Categories", href: "/admin/categories", icon: Grid2X2 },
    { label: "Marques", href: "/admin/brands", icon: Tags },
    { label: "Options", href: "/admin/options", icon: SlidersHorizontal },
    { label: "Media", href: "/admin/media", icon: Images },
    { label: "Utilisateurs", href: "/admin/users", icon: UserCog },
    { label: "Page d'accueil", href: "/admin/homepage", icon: Home },
    { label: "Newsletter", href: "/admin/newsletter", icon: Send },
    {
      label: "Avis",
      href: "/admin/reviews",
      icon: MessageSquareText,
      badge: counts.pendingReviews,
    },
    {
      label: "Messages",
      href: "/admin/messages",
      icon: Mail,
      badge: counts.unreadMessages,
    },
    {
      label: "Demandes d'achat",
      href: "/admin/purchase-requests",
      icon: ShoppingCart,
      badge: counts.pendingPurchaseRequests,
    },
    { label: "Parametres", href: "/admin/settings", icon: Settings },
  ];
}

export function AdminSidebar({
  activePath,
  brand,
  counts,
  user,
}: {
  activePath: string;
  brand: ShowroomSettingsView;
  counts: {
    pendingReviews: number;
    unreadMessages: number;
    pendingPurchaseRequests: number;
  };
  user: {
    name?: string | null;
    email?: string | null;
  };
}) {
  const navigation = getAdminNavigation(counts);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const activePendingHref = pendingHref === activePath ? null : pendingHref;

  return (
    <aside className="flex h-screen w-60 flex-col bg-[#0F0F0F] text-zinc-100">
      <div className="flex min-h-24 shrink-0 flex-col items-center justify-center gap-2 border-b border-white/10 px-5 py-4 text-center">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="max-h-12 max-w-full shrink-0 object-contain"
            height={brand.logoHeight}
            src={brand.logoUrl}
            width={brand.logoWidth}
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#ffc10a] text-sm font-semibold text-[#050b20]">
            {brand.companyName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 max-w-full">
          <p className="truncate text-sm font-semibold">{brand.companyName}</p>
          <p className="text-xs text-zinc-500">Administration</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="grid gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePath === item.href ||
              (item.href !== "/admin/dashboard" &&
                activePath.startsWith(item.href));

            return (
              <Link
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white",
                  isActive && "bg-[#ffc10a] text-[#050b20] shadow-lg shadow-yellow-950/20",
                  activePendingHref === item.href && "bg-white/10 text-white",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setPendingHref(item.href)}
                prefetch
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <Badge className="h-5 min-w-5 justify-center px-1.5 text-[11px]">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="mb-3 rounded-md bg-white/[0.04] p-3">
          <p className="truncate text-sm font-semibold">
            {user.name || "Administrateur"}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p>
        </div>
        <Button
          className="w-full justify-start border-zinc-800 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          size="sm"
          type="button"
          variant="outline"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </Button>
      </div>
    </aside>
  );
}
