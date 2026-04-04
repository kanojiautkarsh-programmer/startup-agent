"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Search, Bell, Sun, Moon, Command, ChevronDown, BellOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onOpenCommand: () => void;
  sidebarCollapsed: boolean;
  user?: { full_name?: string; email?: string } | null;
}

/** Maps pathname prefixes to human-readable page titles */
const PAGE_TITLES: [string, string][] = [
  ["/dashboard", "Overview"],
  ["/startup",   "Venture Lab"],
  ["/chat",      "Intelligence"],
  ["/memory",    "Knowledge Base"],
  ["/goals",     "Strategic Map"],
  ["/clients",   "Network"],
  ["/settings/team", "Team Hub"],
  ["/settings",  "Preferences"],
  ["/onboarding","Initialization"],
];

function usePageTitle(pathname: string): string {
  for (const [prefix, label] of PAGE_TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return label;
  }
  return "App";
}

export function Header({ onOpenCommand, sidebarCollapsed, user: userProp }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState<{ full_name?: string; email?: string } | null | undefined>(userProp);
  const supabase  = createClient();
  const pathname  = usePathname();
  const pageTitle = usePageTitle(pathname);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (userProp !== undefined) {
      setUser(userProp);
      return;
    }
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
          email: authUser.email,
        });
      }
    };
    fetchUser();
  }, [userProp]);

  const isDark = theme === "dark";

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-6 transition-all duration-500",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
      role="banner"
    >
      {/* Left: Breadcrumb + Status */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 shadow-sm">
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 select-none">
            Live
          </span>
        </div>

        <span className="text-muted-foreground/20 text-lg font-light select-none">/</span>

        <h2 className="text-sm font-bold tracking-tight text-foreground/80 truncate select-none">
          {pageTitle}
        </h2>
      </div>

      {/* Center: Global Actions */}
      <div className="hidden lg:flex flex-1 justify-center max-w-md mx-4">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center gap-3 px-4 h-10 rounded-2xl bg-muted/30 border border-border/40 text-muted-foreground hover:bg-muted/50 hover:border-border transition-all group"
        >
          <Search className="size-4 shrink-0 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold uppercase tracking-widest text-left flex-1">Search Terminal</span>
          <kbd className="inline-flex h-6 items-center gap-1 rounded-[6px] border border-border/60 bg-background px-2 font-sans text-[10px] font-bold text-muted-foreground shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: theme, notifications, avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Theme toggle */}
        {mounted && (
          <div
            className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl border border-border/40"
            role="group"
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 rounded-xl transition-all duration-300",
                !isDark ? "bg-background text-foreground shadow-lg shadow-black/5 ring-1 ring-border/60" : "text-muted-foreground/60 hover:text-foreground"
              )}
              onClick={() => setTheme("light")}
            >
              <Sun className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 rounded-xl transition-all duration-300",
                isDark ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground/60 hover:text-foreground"
              )}
              onClick={() => setTheme("dark")}
            >
              <Moon className="size-4" />
            </Button>
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-border/40 transition-all group relative"
            >
              <Bell className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute top-2 right-2.5 size-2 rounded-full border-2 border-background bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] rounded-[2rem] p-3 shadow-2xl obsidian-card">
            <DropdownMenuLabel className="font-bold tracking-tight px-4 py-3 text-lg flex items-center justify-between">
              Update Stream
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">1 New</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-10 mx-2" />
            <div className="flex flex-col items-center gap-3 py-10 text-center px-4">
              <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/20">
                <BellOff className="size-6" />
              </div>
              <p className="text-sm font-bold tracking-tight text-foreground">Cognitive Silence</p>
              <p className="text-xs text-muted-foreground/60 font-medium">No critical updates require your attention at this cycle.</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block h-6 w-px bg-border/40" />

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 group p-1 pr-3 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/40">
              <div className="relative">
                <Avatar className="size-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="hidden xl:flex flex-col items-start text-left">
                <span className="text-xs font-bold leading-none group-hover:text-primary transition-colors">
                  {user?.full_name || "User"}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Pro
                </span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground/40 group-hover:text-primary transition-all" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-[2rem] p-3 shadow-2xl obsidian-card" align="end">
             <div className="p-4 mb-2 bg-primary/5 rounded-2xl border border-primary/10">
               <div className="flex items-center gap-3 mb-1">
                 <Sparkles className="size-3.5 text-primary" />
                 <p className="text-xs font-bold truncate">{user?.full_name || "User"}</p>
               </div>
               <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-tighter ml-6">
                 {user?.email || "No email linked"}
               </p>
             </div>
            <DropdownMenuItem className="rounded-xl font-bold text-xs uppercase tracking-widest p-3 cursor-pointer focus:bg-primary/10 focus:text-primary">
              Control Panel
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl font-bold text-xs uppercase tracking-widest p-3 cursor-pointer focus:bg-primary/10 focus:text-primary">
              Security Layers
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-10 mx-2" />
            <DropdownMenuItem className="rounded-xl font-bold text-xs uppercase tracking-widest p-3 text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
              Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
