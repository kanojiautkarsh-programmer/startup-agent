"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain,
  MessageSquare,
  Target,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react"
import { WaitlistForm } from "@/components/waitlist-form"

const features = [
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "Every decision, commitment, and insight stored forever. Search and recall instantly.",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: MessageSquare,
    title: "Contextual AI",
    description: "Chat with AI that remembers your entire startup journey. No more repeating yourself.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Target,
    title: "Never Miss Deadlines",
    description: "Track goals and commitments with smart reminders that keep you accountable.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: Shield,
    title: "Your Data, Your Keys",
    description: "Bring your own AI keys. We never see your data or touch your API usage.",
    color: "from-orange-500 to-amber-500"
  }
]

const benefits = [
  { label: "Time Saved", value: "10+ hrs/week", icon: Clock },
  { label: "Decisions Tracked", value: "1,000+", icon: Brain },
  { label: "Founders Using", value: "500+", icon: Sparkles },
]

const testimonials = [
  {
    quote: "This has become my second brain. I finally stopped losing track of important decisions.",
    author: "Sarah Chen",
    role: "Founder, TechStart"
  },
  {
    quote: "The accountability features alone are worth it. I hit my Q4 goals for the first time ever.",
    author: "Marcus Johnson",
    role: "CEO, GrowthLabs"
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/20 via-transparent to-transparent dark:from-violet-900/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center group">
            <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-contain group-hover:scale-105 transition-transform" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25">
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 px-4 py-1.5 text-sm mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-violet-700 dark:text-violet-300">Now in Beta — Join 500+ founders</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              The AI That Never Forgets
            </span>
            <br />
            <span className="text-foreground">Your Startup</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Stop losing track of decisions, commitments, and context. Build a memory that persists across every conversation.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" asChild className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-violet-500/25 text-lg font-semibold">
              <Link href="/signup">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 5-minute setup
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> BYOK model
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cancel anytime
            </span>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 blur-2xl rounded-3xl" />
            <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden">
              {/* Window Controls */}
              <div className="h-12 bg-muted/50 flex items-center gap-2 px-4 border-b">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-6 w-64 rounded-md bg-muted/50" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain shrink-0" />
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-xl p-4 mb-3">
                      <p className="text-sm">
                        Based on our memory, you decided to pivot to B2B in November 2024. 
                        I also remember you committed to monthly investor updates. Want me to draft one?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700">Draft Update</Button>
                      <Button size="sm" variant="outline">View Decisions</Button>
                    </div>
                  </div>
                </div>
                
                {/* Stats Bar */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-6">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Memory Items</span>
                      <span className="ml-2 font-semibold">247</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Goals</span>
                      <span className="ml-2 font-semibold">12 active</span>
                    </div>
                  </div>
                  <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-3 gap-8">
            {benefits.map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to run your startup
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built by founders, for founders. No more lost decisions or missed commitments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group relative p-8 rounded-2xl border bg-card hover:bg-muted/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to never forget again</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Add Your Context", description: "Import your startup's history, or let the AI learn as you chat." },
              { step: "02", title: "Chat Naturally", description: "Talk to AI that remembers everything. No need to re-explain." },
              { step: "03", title: "Stay Accountable", description: "Track goals and commitments with smart reminders." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-muted/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by founders</h2>
            <p className="text-muted-foreground text-lg">Join hundreds of founders who never forget</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-8 rounded-2xl border bg-card">
                <p className="text-lg mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to never forget again?
          </h2>
          <p className="text-white/80 text-xl mb-10">
            Join 500+ founders who never lose track of what matters.
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
            <WaitlistForm />
          </div>
          
          <p className="mt-6 text-sm text-white/60">
            No credit card required • Setup in 5 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center mb-4">
                <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
              </Link>
              <p className="text-sm text-muted-foreground">
                The AI that never forgets your startup.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 TaskLyne. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
