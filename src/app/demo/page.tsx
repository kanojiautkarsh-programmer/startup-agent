"use client"

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { 
  MessageSquare, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  ChevronRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Conversations',
    description: 'Chat with an AI that remembers everything about your startup lifecycle.',
  },
  {
    icon: Brain,
    title: 'Persistent Memory',
    description: 'Extracts decisions, commitments, and key developer context automatically.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and track goals with deadlines and automated progress indicators.',
  },
  {
    icon: Zap,
    title: 'Instant Takeaways',
    description: 'Get AI-powered summaries and action items from every conversation.',
  },
]

export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: "Hi! I'm your startup co-pilot. I'll help you remember decisions and track goals.\n\nWhat are you working on today?" }
  ])

  const handleChat = async () => {
    if (!chatInput.trim()) return
    
    setLoading(true)
    const userMessage = chatInput
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "That sounds like a critical milestone. I've logged this as a potentially new decision. Should I create a supporting goal with a deadline for the team?" 
      }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <header className="border-b h-16 flex items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center">
              <span className="text-white text-xs font-bold leading-none">S</span>
            </div>
            <span className="font-serif font-medium text-xl tracking-tight">TaskLyne</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link 
              href="/signup" 
              className="rounded-full px-5 h-10 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center text-xs shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border/60 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#2D211B] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D211B]">Interactive Demo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-8">
            Experience your <br /><span className="italic font-normal">second brain in action.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16 font-medium">
            See how TaskLyne captures every decision, goal, and insight in real-time.
          </p>
        </div>

        {/* Demo Chat - Utilitarian Style */}
        <div className="max-w-4xl mx-auto mb-32">
          <div className="bg-background border border-border/60 rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-[#FAF9F6]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-[#2D211B]">Co-Pilot Active</p>
                   <p className="text-[10px] text-muted-foreground font-medium">Demo Mode</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500" />
                 <span className="w-2 h-2 rounded-full bg-border" />
                 <span className="w-2 h-2 rounded-full bg-border" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-background">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'assistant' ? 'bg-[#2D211B] border-[#2D211B] text-white' : 'bg-background border-border shadow-sm'}`}>
                       {msg.role === 'assistant' ? <Brain className="h-4 w-4" /> : <span className="text-xs font-bold uppercase tracking-widest">U</span>}
                    </div>
                    <div className="flex-1 max-w-[80%]">
                       <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed border ${msg.role === 'assistant' ? 'bg-muted/30' : 'bg-muted'}`}>
                          {msg.content}
                       </div>
                       <p className={`text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-2 px-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                         {msg.role === 'assistant' ? 'TaskLyne' : 'You'}
                       </p>
                    </div>
                 </div>
               ))}
               {loading && (
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#2D211B] text-white flex items-center justify-center shrink-0">
                       <Brain className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                       <div className="p-5 rounded-[1.5rem] bg-muted/30 border w-fit">
                          <div className="flex gap-1">
                             <div className="w-1.5 h-1.5 bg-[#2D211B]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-1.5 h-1.5 bg-[#2D211B]/40 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                             <div className="w-1.5 h-1.5 bg-[#2D211B]/40 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-6 pt-4 bg-background border-t">
               <div className="relative">
                  <input 
                    placeholder="Ask about your startup, log a decision..." 
                    className="w-full h-14 pl-6 pr-14 rounded-full border border-border/80 bg-muted/10 text-sm focus:outline-none focus:border-foreground/30 transition-all font-medium"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    onClick={handleChat}
                    className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-[#2D211B] text-white hover:bg-[#2D211B]/90 transition-all"
                  >
                     <ArrowRight className="h-4 w-4" />
                  </button>
               </div>
               <p className="text-[10px] text-center text-muted-foreground/60 mt-4 font-bold uppercase tracking-[0.2em]">Press Enter to send message</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bento Style */}
      <section className="py-32 px-6 bg-[#FAF9F6] border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <span className="w-1.5 h-6 bg-[#2D211B]" aria-hidden="true"></span>
            <span className="font-serif italic text-3xl text-[#2D211B] tracking-tight">Technical Overview</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-background border border-border/60 rounded-[2rem] p-8 hover:border-foreground/20 transition-all shadow-sm flex flex-col justify-between">
                <div>
                   <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-6">
                      <feature.icon className="h-5 w-5 text-[#2D211B]" />
                   </div>
                   <h3 className="text-xl font-serif font-medium tracking-tight mb-4">{feature.title}</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-6 bg-background text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-12">
            Build your collective <br /><span className="italic font-normal">intelligence today.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="rounded-full px-12 h-16 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-all flex items-center justify-center text-xl shadow-lg"
            >
              Get Started Free <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link 
              href="/pricing" 
              className="rounded-full px-12 h-16 border border-border bg-background hover:bg-muted font-medium transition-all flex items-center justify-center text-xl"
            >
              View Pricing
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
             <span className="flex items-center gap-2">
               <CheckCircle2 className="h-3 w-3" /> No card required
             </span>
             <span className="flex items-center gap-2">
               <CheckCircle2 className="h-3 w-3" /> E2E Encrypted
             </span>
             <span className="flex items-center gap-2">
               <CheckCircle2 className="h-3 w-3" /> SOC 2 Type II
             </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-6 bg-[#FAF9F6]">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-serif font-medium text-xl tracking-tight">TaskLyne</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div className="container mx-auto px-6 max-w-6xl mt-12 pt-12 border-t border-border/40 text-center">
           <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">© 2026 TaskLyne Intelligence Corp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
