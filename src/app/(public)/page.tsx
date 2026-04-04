import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight, Upload, Search, CheckCircle2, Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="bg-background font-sans overflow-hidden">
      <main className="relative">
        {/* Background Glow Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-fade-in" />
        <div className="absolute top-[20%] -right-1/4 w-[600px] h-[600px] bg-primary/3 blur-[100px] rounded-full -z-10 animate-fade-in" style={{ animationDelay: '1s' }} />

        {/* Hero Section */}
        <section className="pt-48 pb-32 px-6 relative">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full border border-border/40 bg-muted/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
              <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Scale your startup intelligence</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8 text-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
              The AI command center <br /><span className="text-muted-foreground">for high-growth teams.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed text-pretty font-medium animate-slide-up" style={{ animationDelay: '0.3s' }}>
              A unified platform to capture your goals, decisions, and context. <br className="hidden md:block" />
              Delivering clarity and speed at every operational step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link 
                href="/demo"
                className="rounded-full px-12 h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all flex items-center justify-center text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                See it in action <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" />
              </Link>
              <Link 
                href="/signup"
                className="rounded-full px-12 h-16 border border-border bg-background hover:bg-muted font-medium transition-all flex items-center justify-center text-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-32 px-6 bg-muted/10/50 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
            
            {/* Bento Block 1 - Large */}
            <div className="md:col-span-8 glass-card border border-border/60 rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-between overflow-hidden relative group animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="relative z-10 max-w-xl">
                <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-4 block">Unified Knowledge Hub</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground mb-6">
                  Log your progress.<br />Stay organized.
                </h2>
                <Link href="/features#memory" className="text-sm font-bold uppercase tracking-widest text-primary flex items-center group-hover:gap-2 transition-all">
                  Explore Memory System <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              
              {/* Feature Preview */}
              <div className="mt-16 bg-muted/20 rounded-3xl p-8 border border-border/40 shadow-inner relative z-10 w-full max-w-xl translate-y-8 group-hover:translate-y-4 transition-transform duration-700 ease-out">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">How It Works</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    "Chat naturally about your startup",
                    "Decisions get auto-captured",
                    "Goals auto-tracked with deadlines"
                  ].map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-background/50 backdrop-blur-sm border border-border/30 rounded-2xl">
                      <span className="font-medium text-sm truncate mr-4">{doc}</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Block 2 - Small */}
            <div className="md:col-span-4 glass-card border border-border/60 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative z-10">
                <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-4 block">Smart Context</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground mb-6">
                  Ask anything, remember everything.
                </h2>
              </div>
              <div className="mt-12 group-hover:scale-105 transition-transform duration-700 ease-out origin-bottom">
                 <div className="bg-muted/30 w-full rounded-3xl p-6 border border-border/40 backdrop-blur-sm">
                    <p className="text-base text-foreground/80 italic leading-relaxed">
                      "Just ask TaskLyne about any decision, goal, or context from your startup journey."
                    </p>
                 </div>
              </div>
            </div>

            {/* Bento Block 3 - Small */}
            <div className="md:col-span-5 glass-card border border-border/60 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden group animate-slide-up" style={{ animationDelay: '0.7s' }}>
               <div className="relative z-10 w-full">
                <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-4 block">Accountability</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground mb-6">
                  Set goals, ship faster.
                </h2>
                
                <div className="mt-12 space-y-6 w-full pt-4">
                  {[
                    "Weekly accountability reviews",
                    "Progress auto-tracked",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      </div>
                      <span className="font-medium text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
               </div>
            </div>

            {/* Bento Block 4 - Large */}
            <div className="md:col-span-7 glass-card border border-border/60 bg-muted/10 rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-center overflow-hidden relative group animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-4 block">Uncompromising Security</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground mb-10 max-w-xl">
                  Enterprise-grade protection <br /><span className="text-muted-foreground">for your velocity.</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 mt-4">
                  {[
                    "SOC 2 Type II Certified", "End-to-End Encryption", "SSO & SAML Ready", "Zero Data Training Policy"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex flex-col gap-3 group/feat">
                       <CheckCircle2 className="h-6 w-6 text-primary/60 group-hover/feat:text-primary transition-colors" />
                       <span className="font-medium text-lg tracking-tight leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-40 px-6 bg-background relative">
           <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-24 text-balance leading-tight animate-slide-up">
               Built for the <br /> <span className="text-muted-foreground">most ambitious founders.</span>
             </h2>
              <div className="grid md:grid-cols-3 gap-8 text-left w-full">
                {[
                   { quote: "Our platform removed all operational friction. We make decisions 5x faster because context is centralized.", person: "Beta User", role: "CEO, Series A" },
                   { quote: "It's like having a chief of staff that never sleeps, indexing every goal and decision we ever set.", person: "Early Adopter", role: "Technical Founder" },
                   { quote: "Investor updates that used to take hours now take literally five minutes. Truly incredible UX.", person: "Verified User", role: "CTO, Seed Stage" },
                ].map((test, idx) => (
                  <div key={idx} className="glass-card border border-border/40 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-sm animate-slide-up" style={{ animationDelay: `${0.9 + idx * 0.1}s` }}>
                    <p className="text-xl leading-relaxed mb-12 font-medium italic">&ldquo;{test.quote}&rdquo;</p>
                    <div>
                      <p className="font-bold text-lg tracking-tight text-foreground">{test.person}</p>
                      <p className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground mt-1.5">{test.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         </section>

        {/* CTA */}
        <section className="py-48 px-6 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 -z-10" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.05)_0,transparent_70%)] -z-10" />
           
           <div className="max-w-4xl mx-auto flex flex-col items-center">
               <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full border border-border/40 bg-background animate-slide-up">
                 <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
                 <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Setup in minutes</span>
               </div>
               <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-16 text-balance leading-[0.9] animate-slide-up">
                 Ready to move <br /><span className="text-muted-foreground">with clarity?</span>
               </h2>
               <Link 
                href="/demo"
                className="rounded-full px-16 h-20 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all flex items-center justify-center text-2xl shadow-2xl hover:scale-[1.03] active:scale-[0.97] animate-slide-up"
              >
                See the Demo <ArrowRight className="ml-4 h-8 w-8" />
              </Link>
           </div>
        </section>
      </main>
    </div>
  )
}




