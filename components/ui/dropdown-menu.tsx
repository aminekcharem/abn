"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    function close() {
      setOpen(false);
    }

    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used together.");
  }

  return context;
}

function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler;
    "aria-expanded"?: boolean;
  }>;
  asChild?: boolean;
}) {
  const { open, setOpen } = useDropdownMenu();

  if (!asChild) {
    return (
      <button
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        type="button"
      >
        {children}
      </button>
    );
  }

  return React.cloneElement(children, {
    "aria-expanded": open,
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      children.props.onClick?.(event);
      setOpen((value) => !value);
    },
  });
}

function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open } = useDropdownMenu();

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-44 rounded-md border border-zinc-800 bg-zinc-950 p-1 text-zinc-100 shadow-xl shadow-black/40",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-9 items-center rounded-sm px-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-zinc-800" />;
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
