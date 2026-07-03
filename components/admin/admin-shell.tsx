"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { ShowroomSettingsView } from "@/lib/settings";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/admin/vehicles": "Vehicules",
  "/admin/categories": "Categories",
  "/admin/brands": "Marques",
  "/admin/media": "Media",
  "/admin/options": "Options",
  "/admin/homepage": "Page d'accueil",
  "/admin/reviews": "Avis",
  "/admin/messages": "Messages",
  "/admin/purchase-requests": "Demandes d'achat",
  "/admin/settings": "Parametres",
};

function getPageTitle(pathname: string) {
  return pageTitles[pathname] ?? "Administration";
}

function getBreadcrumb(pathname: string) {
  const title = getPageTitle(pathname);
  return ["Admin", title];
}

export function AdminShell({
  brand,
  children,
  counts: initialCounts,
  user,
}: {
  brand: ShowroomSettingsView;
  children: ReactNode;
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
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const breadcrumb = useMemo(() => getBreadcrumb(pathname), [pathname]);
  const [counts, setCounts] = useState(initialCounts);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/counters", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setCounts({
            pendingPurchaseRequests: Number(data.pendingPurchaseRequests ?? 0),
            pendingReviews: Number(data.pendingReviews ?? 0),
            unreadMessages: Number(data.unreadMessages ?? 0),
          });
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div
      className={cn(
        "min-h-screen bg-[#141414] text-zinc-50",
        brand.adminTheme === "LIGHT" && "admin-light",
      )}
    >
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-60">
        <AdminSidebar
          activePath={pathname}
          brand={brand}
          counts={counts}
          user={user}
        />
      </div>

      <div className="min-h-screen lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#141414]/95 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  aria-label="Ouvrir la navigation admin"
                  className="lg:hidden"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-60 p-0">
                <AdminSidebar
                  activePath={pathname}
                  brand={brand}
                  counts={counts}
                  user={user}
                />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{title}</h1>
              <nav
                aria-label="Breadcrumb"
                className="mt-1 flex items-center gap-2 text-xs text-zinc-500"
              >
                {breadcrumb.map((item, index) => (
                  <span className="flex items-center gap-2" key={item}>
                    {index > 0 ? <span>/</span> : null}
                    <span className={index === breadcrumb.length - 1 ? "text-zinc-300" : ""}>
                      {item}
                    </span>
                  </span>
                ))}
              </nav>
            </div>
          </div>

          <Button
            className="lg:hidden"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            size="icon"
            type="button"
            variant="ghost"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Deconnexion</span>
          </Button>
        </header>

        <main className="h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
