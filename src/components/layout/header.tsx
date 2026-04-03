"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, Bell, Sun, Moon, Command, ChevronDown } from "lucide-react";
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

export function Header({ onOpenCommand, sidebarCollapsed, user: userProp }: HeaderProps) {
  const [isDark, setIsDark] = React.useState(false);
  const [user, setUser] = React.useState<{ full_name?: string; email?: string } | null | undefined>(userProp);
  const supabase = createClient();

  // Self-fetch user when not provided via prop
  React.useEffect(() => {
    if (userProp !== undefined) {
      setUser(userProp);
      return;
    }
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          email: authUser.email
        });
      }
    };
    fetchUser();
  }, [userProp]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header
      className={`fixed right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm px-6 transition-all duration-200 ${
        sidebarCollapsed ? "left-16" : "left-60"
      }`}
      role="banner"
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          className="flex items-center gap-3 px-4 h-9 min-w-[220px] rounded-full bg-muted/40 border border-border/40 text-muted-foreground hover:bg-muted/60 hover:border-border transition-colors duration-150"
          onClick={onOpenCommand}
          aria-label="Search (⌘K)"
          aria-keyshortcuts="Meta+K"
        >
          <Search className="size-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">Search...</span>
          <div className="ml-auto flex items-center gap-1 border border-border/60 bg-background/50 px-1.5 py-0.5 rounded-md" aria-hidden="true">
            <Command className="size-2.5" />
            <span className="text-[9px] font-bold font-mono">K</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/40" role="group" aria-label="Color theme">
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-7 rounded-full transition-colors duration-150", !isDark ? "bg-white text-black shadow-sm" : "text-muted-foreground")}
            onClick={() => isDark && toggleTheme()}
            aria-label="Switch to light mode"
            aria-pressed={!isDark}
          >
            <Sun className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-7 rounded-full transition-colors duration-150", isDark ? "bg-[#2D211B] text-white shadow-sm" : "text-muted-foreground")}
            onClick={() => !isDark && toggleTheme()}
            aria-label="Switch to dark mode"
            aria-pressed={isDark}
          >
            <Moon className="size-3.5" aria-hidden="true" />
          </Button>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/40 transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/60 p-2 shadow-lg">
            <DropdownMenuLabel className="font-serif px-3 py-2 text-base">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-40" />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl hover:bg-muted/50 transition-colors">
              <p className="text-sm font-bold tracking-tight">Welcome to the Command Center</p>
              <p className="text-xs text-muted-foreground font-medium">TaskLyne is ready to scale your startup context.</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border/40" aria-hidden="true" />

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted/50 transition-colors duration-150 border border-transparent hover:border-border/40"
              aria-label="Open profile menu"
            >
              <Avatar className="size-8 ring-1 ring-border/40">
                <AvatarFallback className="bg-[#2D211B] text-white font-bold text-[10px]">
                  {user?.full_name
                    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-[10px] font-bold uppercase text-muted-foreground/60 leading-none mb-0.5">Admin</span>
                <span className="text-xs font-bold leading-none">{user?.full_name?.split(' ')[0] || 'User'}</span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground/50" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl border-border/60 p-2 shadow-lg" align="end" forceMount>
            <div className="px-3 py-3 mb-2 bg-muted/30 rounded-xl">
              <p className="text-xs font-bold truncate tracking-tight">{user?.full_name || 'User'}</p>
              <p className="text-[10px] font-medium text-muted-foreground truncate">{user?.email || 'No email'}</p>
            </div>
            <DropdownMenuItem className="rounded-lg font-medium text-sm cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg font-medium text-sm cursor-pointer">
              <Link href="/settings" className="w-full">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg font-medium text-sm cursor-pointer">Billing</DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-40" />
            <DropdownMenuItem className="rounded-lg font-medium text-sm text-red-500 cursor-pointer">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
