"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight, Brain, Target, ChevronDown } from "lucide-react"

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [productOpen, setProductOpen] = React.useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group" aria-label="TaskLyne Home">
              <span className="font-extrabold text-3xl tracking-tighter hover:opacity-80 transition-opacity">TaskLyne</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <div className="relative group/product">
                <button 
                  className="flex items-center gap-1.5 hover:text-primary transition-colors py-8"
                  onMouseEnter={() => setProductOpen(true)}
                  aria-expanded={productOpen}
                >
                  Product
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${productOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {productOpen && (
                  <div 
                    className="absolute top-full left-0 mt-0 w-80 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-3 animate-slide-up"
                    onMouseLeave={() => setProductOpen(false)}
                  >
                    <Link href="/features#memory" className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-all group/item">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                        <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">AI Memory</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">Persistent context storage for your startup</p>
                      </div>
                    </Link>
                    <Link href="/features#goals" className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-all group/item mt-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                        <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Goal Tracking</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">OKRs and automated accountability</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
              
              <Link href="/about" className="hover:text-primary transition-colors">Company</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden md:inline-flex rounded-full px-6 font-semibold hover:bg-muted">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/demo">Request demo <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
            <button 
              className="lg:hidden p-2.5 hover:bg-muted rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-7 w-7" aria-hidden="true" /> : <Menu className="h-7 w-7" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Content */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-border/40 lg:hidden transform transition-transform duration-500 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-12">
            <span className="font-extrabold text-2xl tracking-tighter">TaskLyne</span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-xl font-semibold">
            <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/20">Product</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/20">Company</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/20">Pricing</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/20">Contact</Link>
          </nav>

          <div className="mt-auto space-y-4 pb-8">
            <Button variant="outline" asChild className="w-full rounded-full h-14 text-lg font-semibold border-border/60">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            </Button>
            <Button asChild className="w-full rounded-full h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90">
              <Link href="/demo" onClick={() => setMobileMenuOpen(false)}>Request demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

