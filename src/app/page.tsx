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
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/5"
  },
  {
    icon: MessageSquare,
    title: "Contextual Memory",
    description: "Chat with an assistant that remembers your entire startup journey. No more repeating yourself.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/5"
  },
  {
    icon: Target,
    title: "Never Miss Deadlines",
    description: "Track goals and commitments with smart reminders that keep you accountable.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/5"
  },
  {
    icon: Shield,
    title: "Your Data, Your Keys",
    description: "Bring your own API keys. We never see your data or touch your usage.",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/5"
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
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 animated-gradient-bg" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center group">
            <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="h-9 w-9 rounded-xl object-contain group-hover:scale-105 transition-transform duration-300" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex transition-all duration-200">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300">
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm text-violet-600 dark:text-violet-400 mb-6">
                <Sparkles className="h-4 w-4" />
                <span>For startup founders who value their time</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Your Startup&apos;s{" "}
                <span className="gradient-text">Memory</span>
                <br />
                That Never Forgets
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
                Stop repeating yourself. Let your assistant remember every decision, 
                track every goal, and keep you accountable — so you can focus on building.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 h-12 px-8">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 border-violet-500/20 hover:bg-violet-500/5 transition-all duration-300">
                  <Link href="/login">
                    View Demo
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mockup */}
            <div className="mt-16 relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
              <div className="glass rounded-2xl border border-border/50 p-6 shadow-2xl shadow-violet-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs text-muted-foreground">TaskLyne Assistant</span>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain shrink-0" />
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 mb-3">
                      <p className="text-sm">
                        Based on our memory, you decided to pivot to B2B in November 2024. 
                        I also remember you committed to monthly investor updates. Want me to draft one?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 transition-colors">Draft Update</Button>
                      <Button size="sm" variant="outline">View Decisions</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything you need to stay organized
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built specifically for founders who need to track decisions, set goals, 
                and never lose context again.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group relative p-6 rounded-2xl glass border border-border/50 card-hover animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Get started in minutes
              </h2>
              <p className="text-muted-foreground text-lg">
                Three simple steps to never lose track again.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Add Your Context", description: "Import your startup's history, or let the assistant learn as you chat." },
                { step: "02", title: "Chat Naturally", description: "Talk to a memory that remembers everything. No need to re-explain." },
                { step: "03", title: "Stay Accountable", description: "Set goals, track commitments, and get gentle nudges when you need them." }
              ].map((item, index) => (
                <div key={item.step} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="text-6xl font-bold text-muted/20 absolute -top-4 -left-2">{item.step}</div>
                  <div className="relative pt-8">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass rounded-2xl border border-border/50 p-8 md:p-12">
              <div className="grid grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={benefit.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <benefit.icon className="h-8 w-8 mx-auto mb-3 text-violet-500" />
                    <div className="text-3xl md:text-4xl font-bold mb-1 gradient-text">{benefit.value}</div>
                    <div className="text-sm text-muted-foreground">{benefit.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Loved by founders
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  className="p-6 rounded-2xl glass border border-border/50 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-blue-600/10 rounded-3xl" />
              <div className="absolute inset-0 animated-gradient-bg rounded-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Ready to never forget again?
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Your startup&apos;s memory, decisions, and commitments — always remembered.
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 h-12 px-8">
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center mb-4">
                <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
              </Link>
              <p className="text-sm text-muted-foreground">
                Your startup&apos;s memory, decisions, and commitments — always remembered.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 TaskLyne. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
