"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Home,
  Brain,
  Target,
  Settings,
  Plus,
  FileText,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  { title: "Start new chat", href: "/chat", icon: MessageSquare },
  { title: "Go to Home", href: "/dashboard", icon: Home },
  { title: "Go to Memory", href: "/memory", icon: Brain },
  { title: "Go to Goals", href: "/goals", icon: Target },
  { title: "Go to Settings", href: "/settings", icon: Settings },
  { title: "Add new goal", href: "/goals", icon: Plus },
  { title: "Create decision", href: "/memory", icon: FileText },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="rounded-xl border bg-popover shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center border-b px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-12 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <Link
                      key={cmd.href + cmd.title}
                      href={cmd.href}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {cmd.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
              to toggle
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                esc
              </kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
