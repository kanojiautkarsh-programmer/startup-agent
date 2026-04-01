"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const CommandPaletteComponent = dynamic(
  () => import("@/components/command/command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function CommandPaletteWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <CommandPaletteComponent open={open} onOpenChange={setOpen} />
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
