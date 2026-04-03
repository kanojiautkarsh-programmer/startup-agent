"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, Bell, Sun, Moon, Command, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onOpenCommand: () => void;
  sidebarCollapsed: boolean;
  user?: { full_name?: string; email?: string } | null;
}

export function Header({ onOpenCommand, sidebarCollapsed, user }: HeaderProps) {
  const [isDark, setIsDark] = React.useState(true);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header
      className={`fixed right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-60"
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          className="flex items-center gap-3 px-4 h-9 min-w-[240px] rounded-full bg-muted/40 border border-border/40 text-muted-foreground hover:bg-muted/60 hover:border-border transition-all group"
          onClick={onOpenCommand}
        >
          <Search className="h-3.5 w-3.5 group-hover:text-foreground transition-colors" />
          <span className="text-xs font-semibold tracking-tight">Search intelligence...</span>
          <div className="ml-auto flex items-center gap-1 border border-border/60 bg-background/50 px-1.5 py-0.5 rounded-md">
            <Command className="h-2.5 w-2.5" />
            <span className="text-[9px] font-bold font-mono">K</span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/40">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-full transition-all", isDark ? "text-muted-foreground" : "bg-white text-black shadow-sm")}
            onClick={() => isDark && toggleTheme()}
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-full transition-all", !isDark ? "text-muted-foreground" : "bg-[#2D211B] text-white shadow-sm")}
            onClick={() => !isDark && toggleTheme()}
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
        </div>

        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/40 transition-all">
            <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/60 p-2 shadow-2xl">
            <DropdownMenuLabel className="font-serif px-3 py-2 text-lg">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="opacity-40" />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl hover:bg-muted/50 transition-colors">
              <p className="text-sm font-bold tracking-tight">Welcome to the Command Center</p>
              <p className="text-xs text-muted-foreground font-medium">TaskLyne is ready to scale your startup context.</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border/40 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-muted/50 transition-all border border-transparent hover:border-border/40">
              <Avatar className="h-8 w-8 ring-1 ring-border/40">
                <AvatarFallback className="bg-[#2D211B] text-white font-bold text-[10px]">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-0.5">Admin</span>
                <span className="text-xs font-bold leading-none">{user?.full_name?.split(' ')[0] || 'User'}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl border-border/60 p-2 shadow-2xl" align="end" forceMount>
            <div className="px-3 py-3 mb-2 bg-muted/30 rounded-xl">
              <p className="text-xs font-bold truncate tracking-tight">{user?.full_name || 'User'}</p>
              <p className="text-[10px] font-medium text-muted-foreground truncate tracking-wide">{user?.email || 'No email'}</p>
            </div>
            <DropdownMenuItem className="rounded-lg font-medium text-sm">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg font-medium text-sm">
              <Link href="/settings" className="w-full">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg font-medium text-sm">Billing</DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-40" />
            <DropdownMenuItem className="rounded-lg font-medium text-sm text-red-500">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
