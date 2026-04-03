'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { 
  Brain, 
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-react'
import Link from 'next/link'

const COMMON_QUESTIONS = [
  {
    question: "What's our current progress on the product launch?",
    answer: "Based on your goals, the product launch is tracking at 60% completion. The main milestones achieved: beta testing complete, final QA in progress. Remaining tasks: security audit, documentation, and marketing assets."
  },
  {
    question: "What decisions did we make last week?",
    answer: "You've logged 3 key decisions this week:\n• Decided on API-first architecture for v2\n• Approved $15K marketing budget for launch\n• Selected Notion for documentation\n\nAll decisions are tagged and searchable."
  },
  {
    question: "Who do we need to follow up with?",
    answer: "Based on your commitments, you have 2 pending follow-ups:\n• Investor call with Sequoia - scheduled for Friday\n• Partnership discussion with TechCorp - needs scheduling\n\nI've reminded you 3 times about the TechCorp follow-up."
  },
  {
    question: "What's our burn rate?",
    answer: "Current monthly burn rate: $42,000\n\nBreakdown: Salaries (65%), Tools (15%), Marketing (12%), Misc (8%)\n\nWith current runway: ~6 months until Series A needed."
  },
  {
    question: "Set a goal to launch MVP by end of Q2",
    answer: "I've created the goal: 'Launch MVP'\n\nTarget: June 30, 2026\nPriority: High\nStatus: Active\n\nI've also broken it down into sub-tasks based on your conversation context."
  }
]

export default function DemoPage() {
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm TaskLyne, your startup's AI memory. I help founders track decisions, goals, and stay accountable.\n\nTry one of these common questions to see me in action:" 
    }
  ])
  const [loading, setLoading] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)

  const handleQuestionClick = (index: number) => {
    const qa = COMMON_QUESTIONS[index]
    setSelectedQuestion(index)
    setLoading(true)
    
    setMessages(prev => [...prev, { role: 'user', content: qa.question }])
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: qa.answer }])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <header className="border-b h-16 flex items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-bold text-2xl tracking-tight">TaskLyne</span>
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
            See AI-powered <br /><span className="italic font-normal">memory in action.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-medium">
            Click a question below to see how TaskLyne retrieves context, tracks goals, and keeps you accountable.
          </p>
        </div>

        {/* Quick Questions */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {COMMON_QUESTIONS.map((qa, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(index)}
                disabled={loading}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedQuestion === index 
                    ? 'bg-[#2D211B] text-white border-[#2D211B]' 
                    : 'bg-background border-border hover:border-foreground/20'
                }`}
              >
                {qa.question.slice(0, 30)}...
              </button>
            ))}
          </div>
        </div>

        {/* Demo Chat */}
        <div className="max-w-4xl mx-auto mb-32">
          <div className="bg-background border border-border/60 rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-[#FAF9F6]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-[#2D211B]">TaskLyne Active</p>
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
                       <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed border whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-muted/30' : 'bg-muted'}`}>
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
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-medium tracking-tight mb-12">
            Your data stays <span className="italic">yours.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-3xl border">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold text-lg mb-2">Fresh Start</h3>
              <p className="text-muted-foreground text-sm">Every user starts with a clean slate. Add your own decisions, goals, and context.</p>
            </div>
            <div className="bg-background p-8 rounded-3xl border">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold text-lg mb-2">Zero Training</h3>
              <p className="text-muted-foreground text-sm">Your data is never used to train AI models. Period.</p>
            </div>
            <div className="bg-background p-8 rounded-3xl border">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold text-lg mb-2">End-to-End Encrypted</h3>
              <p className="text-muted-foreground text-sm">Your startup memory is encrypted and secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center bg-[#FAF9F6] border-t">
         <div className="max-w-4xl mx-auto flex flex-col items-center">
             <h2 className="text-6xl md:text-7xl font-serif font-medium tracking-tight mb-12">
               Ready for your <br /><span className="italic font-normal">own memory?</span>
             </h2>
             <Link 
              href="/signup"
              className="rounded-full px-12 h-16 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-all flex items-center justify-center text-lg shadow-xl hover:scale-[1.02]"
            >
              Start Free <Plus className="ml-2 h-5 w-5" />
             </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-6 bg-[#FAF9F6]">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl tracking-tight">TaskLyne</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <div className="container mx-auto px-6 max-w-6xl mt-12 pt-12 border-t border-border/40 text-center">
           <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">© 2026 TaskLyne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
