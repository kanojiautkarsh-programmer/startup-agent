"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Search, Bell, Sun, Moon, Command, ChevronDown, BellOff } from "lucide-react";
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
  ["/dashboard", "Dashboard"],
  ["/startup",   "Startup Overview"],
  ["/chat",      "Chat & Intelligence"],
  ["/memory",    "Memory & Index"],
  ["/goals",     "Goals & Tracking"],
  ["/clients",   "Clients"],
  ["/settings/team", "Team Settings"],
  ["/settings",  "Settings"],
  ["/onboarding","Onboarding"],
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
        "fixed right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 transition-all duration-200",
        sidebarCollapsed ? "left-16" : "left-60"
      )}
      role="banner"
    >
      {/* Left: page breadcrumb + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Page title breadcrumb */}
        <span
          className="hidden md:block text-xs font-semibold text-muted-foreground/60 whitespace-nowrap select-none"
          aria-label={`Current page: ${pageTitle}`}
        >
          {pageTitle}
        </span>

        <span className="hidden md:block w-px h-4 bg-border/60" aria-hidden="true" />

        {/* Search trigger */}
        <button
          className="flex items-center gap-3 px-4 h-9 min-w-[180px] md:min-w-[220px] rounded-full bg-muted/50 border border-border/60 text-muted-foreground hover:bg-muted hover:border-border transition-colors duration-150"
          onClick={onOpenCommand}
          aria-label="Search (⌘K)"
          aria-keyshortcuts="Meta+K"
        >
          <Search className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium">Search...</span>
          <div
            className="ml-auto flex items-center gap-1 border border-border/60 bg-background px-1.5 py-0.5 rounded-md"
            aria-hidden="true"
          >
            <Command className="size-2.5" />
            <span className="text-[9px] font-bold font-mono">K</span>
          </div>
        </button>
      </div>

      {/* Right: theme, notifications, avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle */}
        {mounted && (
          <div
            className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-full border border-border/40"
            role="group"
            aria-label="Color theme"
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-7 rounded-full transition-colors duration-150",
                !isDark ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground"
              )}
              onClick={() => setTheme("light")}
              aria-label="Light mode"
              aria-pressed={!isDark}
            >
              <Sun className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-7 rounded-full transition-colors duration-150",
                isDark ? "bg-emphasis text-emphasis-fg shadow-sm" : "text-muted-foreground"
              )}
              onClick={() => setTheme("dark")}
              aria-label="Dark mode"
              aria-pressed={isDark}
            >
              <Moon className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full hover:bg-muted border border-transparent hover:border-border/40 transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-lg">
            <DropdownMenuLabel className="font-bold tracking-tight px-3 py-2 text-base">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-40" />
            {/* Proper empty state */}
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BellOff className="size-8 text-muted-foreground/25" aria-hidden="true" />
              <p className="text-xs font-semibold text-muted-foreground">All caught up</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium">No new notifications right now.</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border/60" aria-hidden="true" />

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-muted transition-colors duration-150 border border-transparent hover:border-border/40"
              aria-label="Open profile menu"
            >
              <Avatar className="size-8 ring-1 ring-border/60">
                <AvatarFallback className="bg-emphasis text-emphasis-fg font-bold text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs font-semibold leading-none">
                  {user?.full_name?.split(" ")[0] || "User"}
                </span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground/60" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-lg" align="end" forceMount>
            <div className="px-3 py-3 mb-1 bg-muted/50 rounded-xl border border-border/40">
              <p className="text-xs font-bold truncate">{user?.full_name || "User"}</p>
              <p className="text-[10px] font-medium text-muted-foreground truncate">
                {user?.email || "No email"}
              </p>
            </div>
            <DropdownMenuItem className="rounded-lg font-medium text-sm cursor-pointer">
              <Link href="/settings" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg font-medium text-sm cursor-pointer">
              <Link href="/settings" className="w-full">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-40" />
            <DropdownMenuItem className="rounded-lg font-medium text-sm text-destructive cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
