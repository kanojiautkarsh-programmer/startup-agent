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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group" aria-label="TaskLyne Home">
              <span className="font-extrabold text-3xl tracking-tighter">TaskLyne</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <div className="relative">
                <button 
                  className="flex items-center gap-1.5 hover:text-accent-orange transition-colors"
                  onClick={() => setProductOpen(!productOpen)}
                  aria-expanded={productOpen}
                  aria-controls="product-dropdown"
                >
                  Product
                  <ChevronDown className={`h-4 w-4 transition-transform ${productOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {productOpen && (
                  <div id="product-dropdown" className="absolute top-full left-0 mt-4 w-72 bg-card rounded-2xl shadow-xl border border-border p-3 animate-fade-in-up">
                    <Link href="/features" className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors">
                      <div className="w-10 h-10 bg-muted-blue rounded-xl flex items-center justify-center shrink-0">
                        <Brain className="h-5 w-5 text-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">AI Memory</p>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">Persistent context storage for your startup</p>
                      </div>
                    </Link>
                    <Link href="/features" className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted transition-colors mt-1">
                      <div className="w-10 h-10 bg-muted-yellow rounded-xl flex items-center justify-center shrink-0">
                        <Target className="h-5 w-5 text-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Goal Tracking</p>
                        <p className="text-sm text-muted-foreground mt-1 text-pretty">OKRs and automated accountability</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
              
              <Link href="/features" className="hover:text-accent-orange transition-colors">Features</Link>
              <Link href="/about" className="hover:text-accent-orange transition-colors">Company</Link>
              <Link href="/pricing" className="hover:text-accent-orange transition-colors">Pricing</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex rounded-full px-6 font-semibold hover:bg-accent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-sm transition-[transform,background-color] hover:scale-[1.02] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1">
              <Link href="/demo">Request demo <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
            <button 
              className="lg:hidden p-3 hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background lg:hidden pt-28 px-6 animate-fade-in pb-[env(safe-area-inset-bottom)]">
          <nav className="space-y-6 flex flex-col h-full">
            <Link href="/features" className="block text-2xl font-semibold hover:text-accent-orange transition-colors focus-visible:ring-1 focus-visible:ring-ring rounded">Product</Link>
            <Link href="/about" className="block text-2xl font-semibold hover:text-accent-orange transition-colors focus-visible:ring-1 focus-visible:ring-ring rounded">Company</Link>
            <Link href="/pricing" className="block text-2xl font-semibold hover:text-accent-orange transition-colors focus-visible:ring-1 focus-visible:ring-ring rounded">Pricing</Link>
            <Link href="/contact" className="block text-2xl font-semibold hover:text-accent-orange transition-colors focus-visible:ring-1 focus-visible:ring-ring rounded">Contact</Link>
            <div className="mt-auto pb-8 space-y-4">
              <Button variant="outline" asChild className="w-full rounded-full h-14 text-lg font-semibold"><Link href="/login">Log in</Link></Button>
              <Button asChild className="w-full rounded-full h-14 text-lg font-semibold bg-accent-orange hover:bg-accent-orange/90 text-black border-transparent"><Link href="/demo">Request demo</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
