"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Monitor, ArrowLeft, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DesktopOnlyProps {
  children: React.ReactNode
}

export function DesktopOnly({ children }: DesktopOnlyProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkDesktop = () => {
      // 1024px is the 'lg' breakpoint in Tailwind. 
      // We consider 1024 and above as desktop/large tablet landscape.
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkDesktop()
    window.addEventListener("resize", checkDesktop)
    return () => window.removeEventListener("resize", checkDesktop)
  }, [])

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) return null

  if (isDesktop === false) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-6">
        {/* Midnight Obsidian Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-card/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md premium-glass rounded-[2.5rem] p-10 md:p-12 text-center shadow-2xl animate-scale-in">
          <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20">
            <Monitor className="size-10" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Desktop Access <span className="text-muted-foreground/60">Required</span>
          </h1>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-10 font-medium">
            The TaskLyne command center is optimized for high-density desktop workflows. 
            Please switch to a desktop or laptop to access the platform.
          </p>

          <div className="space-y-4">
            <Link 
              href="/"
              className="w-full h-14 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg active:scale-[0.98]"
            >
              <ArrowLeft className="mr-2 size-4" /> Go to Website
            </Link>
            
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 text-left">
              <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground/60 leading-normal font-medium leading-tight">
                Our mobile app is currently in development. Sign up on desktop to receive early access notification.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border/40 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/30">
            TaskLyne Intelligence Systems
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
