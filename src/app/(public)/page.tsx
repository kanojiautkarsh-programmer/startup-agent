import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight, Upload, Search, CheckCircle2, Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="bg-background font-sans">
      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-32 px-6">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center animate-fade-in-up">
            <div className="flex items-center gap-3 mb-10">
              <span className="w-1.5 h-6 bg-[#2D211B]" aria-hidden="true"></span>
              <span className="font-serif italic text-2xl md:text-3xl text-muted-foreground tracking-tight">Scale your startup intelligence</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-[5.5rem] font-serif font-medium tracking-tight leading-[1.05] mb-12 text-foreground">
              The AI command center <br /><span className="italic font-normal">for high-growth teams.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed text-pretty font-medium">
              A unified platform to capture your goals, decisions, and context. <br className="hidden md:block" />
              Delivering clarity and speed at every operational step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link 
                href="/demo"
                className="rounded-full px-12 h-16 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-all flex items-center justify-center text-xl shadow-sm"
              >
                See it in action <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
              </Link>
              <Link 
                href="/signup"
                className="rounded-full px-12 h-16 border border-border bg-background hover:bg-muted font-medium transition-all flex items-center justify-center text-xl"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-32 px-6 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento Block 1 - Large */}
            <div className="md:col-span-8 bg-background border border-border/60 rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-between overflow-hidden relative group hover:border-foreground/20 transition-all shadow-sm">
              <div className="relative z-10 max-w-xl">
                <span className="font-serif italic text-xl md:text-2xl text-muted-foreground/80 mb-6 block">Unified Knowledge Hub</span>
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-tight text-foreground mb-6">
                  Log your progress.<br />Stay organized.
                </h2>
                <Link href="/memory" className="text-sm font-bold uppercase tracking-widest text-[#2D211B] flex items-center group-hover:gap-2 transition-all">
                  Explore Memory System <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              
              {/* Feature Preview */}
              <div className="mt-16 bg-muted/20 rounded-3xl p-8 border border-border shadow-inner relative z-10 w-full max-w-xl translate-y-8 group-hover:translate-y-4 transition-transform duration-500 ease-out">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2D211B] rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">How It Works</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    "Chat naturally about your startup",
                    "Decisions get auto-captured",
                    "Goals auto-tracked with deadlines"
                  ].map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-background border border-border/40 rounded-2xl">
                      <span className="font-medium text-sm truncate mr-4">{doc}</span>
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Block 2 - Small */}
            <div className="md:col-span-4 bg-background border border-border/60 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group hover:border-foreground/20 transition-all shadow-sm">
              <div className="relative z-10">
                <span className="font-serif italic text-xl md:text-2xl text-muted-foreground/80 mb-6 block">Smart Context</span>
                <h2 className="text-4xl font-serif font-medium tracking-tight leading-tight text-foreground mb-6">
                  Ask anything, remember everything.
                </h2>
              </div>
              <div className="mt-12 group-hover:scale-105 transition-transform duration-500 ease-out origin-bottom">
                 <div className="bg-muted/30 w-full rounded-3xl p-6 border border-border/60">
                    <p className="text-sm text-muted-foreground italic">
                      "Just ask TaskLyne about any decision, goal, or context from your startup journey."
                    </p>
                 </div>
              </div>
            </div>

            {/* Bento Block 3 - Small */}
            <div className="md:col-span-5 bg-background border border-border/60 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden group hover:border-foreground/20 transition-all shadow-sm">
               <div className="relative z-10 w-full">
                <span className="font-serif italic text-xl md:text-2xl text-muted-foreground/80 mb-6 block">Accountability</span>
                <h2 className="text-4xl font-serif font-medium tracking-tight leading-tight text-foreground mb-6">
                  Set goals, ship faster.
                </h2>
                
                <div className="mt-12 space-y-6 w-full pt-4">
                  {[
                    "Weekly accountability reviews",
                    "Progress auto-tracked",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="font-medium text-base">{feature}</span>
                    </div>
                  ))}
                </div>
               </div>
            </div>

            {/* Bento Block 4 - Large */}
            <div className="md:col-span-7 bg-[#2D211B] rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-center overflow-hidden shadow-xl text-white relative">
              <div className="relative z-10">
                <span className="font-serif italic text-xl md:text-2xl text-white/60 mb-6 block">Uncompromising Security</span>
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-tight mb-10 max-w-xl">
                  Enterprise-grade protection <br /><span className="italic font-normal">for your velocity.</span>
                </h2>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12 mt-4">
                  {[
                    "SOC 2 Type II Certified", "End-to-End Encryption", "SSO & SAML Ready", "Zero Data Training Policy"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                       <CheckCircle2 className="h-6 w-6 text-white/40" />
                       <span className="font-medium text-lg tracking-tight leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-40 px-6 bg-background">
           <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
             <h2 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-20 text-balance leading-tight">
               Built for the <br /> <span className="italic font-normal">most ambitious founders.</span>
             </h2>
              <div className="grid md:grid-cols-3 gap-6 text-left w-full">
                {[
                   { quote: "Our platform removed all operational friction. We make decisions 5x faster because context is centralized.", person: "Beta User", role: "CEO, Series A" },
                   { quote: "It's like having a chief of staff that never sleeps, indexing every goal and decision we ever set.", person: "Early Adopter", role: "Technical Founder" },
                   { quote: "Investor updates that used to take hours now take literally five minutes. Truly incredible UX.", person: "Verified User", role: "CTO, Seed Stage" },
                ].map((test, idx) => (
                  <div key={idx} className="bg-muted/10 border border-border/40 rounded-[2rem] p-10 flex flex-col justify-between hover:border-foreground/20 transition-all shadow-sm">
                    <p className="text-xl leading-relaxed mb-12 font-medium italic">&ldquo;{test.quote}&rdquo;</p>
                    <div>
                      <p className="font-bold text-base tracking-tight">{test.person}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">{test.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         </section>

        {/* CTA */}
        <section className="py-48 px-6 text-center bg-[#FAF9F6] border-t">
           <div className="max-w-4xl mx-auto flex flex-col items-center">
               <div className="flex items-center gap-3 mb-10">
                 <span className="w-1.5 h-6 bg-[#2D211B]" aria-hidden="true"></span>
                 <span className="font-serif italic text-3xl text-muted-foreground tracking-tight">Setup in minutes</span>
               </div>
               <h2 className="text-6xl md:text-8xl font-serif font-medium tracking-tight mb-16 text-balance leading-[0.9]">
                 Ready to move <br /><span className="italic font-normal">with clarity?</span>
               </h2>
               <Link 
                href="/demo"
                className="rounded-full px-16 h-20 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-all flex items-center justify-center text-2xl shadow-xl hover:scale-[1.02]"
              >
                See the Demo <ArrowRight className="ml-4 h-8 w-8" />
              </Link>
           </div>
        </section>
      </main>
    </div>
  )
}
