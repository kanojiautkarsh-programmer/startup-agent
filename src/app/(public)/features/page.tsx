import Link from "next/link"
import { Metadata } from "next"

import { Brain, Target, ClipboardList, Database, Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Features",
  description: "Explore AI Memory, Goal Tracking, and the Decision Log."
};

export default function FeaturesPage() {
  const features = [
    {
      id: "memory",
      title: "AI Memory",
      tagline: "Your startup's collective brain.",
      description: "Never lose a strategic nuance or a critical decision. TaskLyne captures context naturally, building a persistent memory that scales with your growth.",
      icon: <Brain className="h-8 w-8 text-primary" />,
      bullets: ["Conversational context capture", "Automated decision indexing", "Semantic search across history"],
      color: "bg-blue-500/10"
    },
    {
      id: "goals",
      title: "Goal Tracking",
      tagline: "Accountability without the friction.",
      description: "Set OKRs and track progress with automated accountability reviews. TaskLyne keeps your team aligned on what matters most.",
      icon: <Target className="h-8 w-8 text-primary" />,
      bullets: ["Automated weekly reviews", "Visual progress mapping", "Alignment diagnostics"],
      color: "bg-green-500/10"
    },
    {
      id: "decisions",
      title: "Decision Log",
      tagline: "The source of truth for strategy.",
      description: "A centralized repository of every pivot, strategy shift, and operational choice. Understand the 'why' behind every move.",
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      bullets: ["One-click decision logging", "Rationale tracking", "Audit-ready reporting"],
      color: "bg-purple-500/10"
    }
  ]

  return (
    <main className="w-full flex-1 bg-background overflow-hidden">
      {/* Dynamic Hero */}
      <section className="pt-48 pb-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10 animate-fade-in" />
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8 animate-slide-up bg-muted/40 px-4 py-1.5 rounded-full border border-border/40">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">The New Standard</span>
          </div>
          <h1 className="text-6xl sm:text-7xl  font-medium tracking-tight mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Built for <span className="text-muted-foreground">intelligence.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80 font-medium max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            TaskLyne replaces static docs and fragmented tools with a unified AI command center for your entire startup engine.
          </p>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Feature 1 - AI Memory */}
            <div id="memory" className="md:col-span-12 lg:col-span-7 glass-card rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-between group animate-slide-up" style={{ animationDelay: '0.3s' }}>
               <div className="max-w-xl">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-colors">
                    <Brain className="h-8 w-8 text-primary" />
                 </div>
                 <h2 className="text-4xl md:text-5xl  font-medium tracking-tight mb-6">AI Memory</h2>
                 <p className="text-xl text-muted-foreground/90 font-medium mb-12 leading-relaxed">
                   Capture the "Why" behind every strategic move. TaskLyne builds a persistent knowledge graph of your startup's evolution.
                 </p>
                 <div className="grid sm:grid-cols-2 gap-4">
                    {["Conversational capture", "Decision indexing", "Context threading", "Stakeholder tracking"].map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                           <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                         </div>
                         <span className="font-medium text-foreground/80">{b}</span>
                      </div>
                    ))}
                 </div>
               </div>
               <div className="mt-20 relative h-[300px] w-full bg-muted/20 rounded-3xl border border-border/40 overflow-hidden shadow-inner group-hover:translate-y-[-8px] transition-transform duration-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  {/* Visual mockup element */}
                  <div className="absolute top-10 left-10 right-10 bg-background border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
                     <div className="flex items-center gap-3 border-b border-border/20 pb-4">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Context Capture</span>
                     </div>
                     <p className="text-sm font-medium italic">"Captured decision from the Series A roadmap meeting: Pivoting to PLG for European markets due to 0.45 CAC efficiency..."</p>
                  </div>
               </div>
            </div>

            {/* Feature 2 - Goal Tracking */}
            <div id="goals" className="md:col-span-12 lg:col-span-5 glass-card rounded-[2.5rem] p-10 md:p-14 flex flex-col animate-slide-up group" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-4xl  font-medium tracking-tight mb-6">Goal Tracking</h2>
                <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
                  Connect high-level strategy to daily execution with automated OKR tracking and accountability loops.
                </p>
                <div className="space-y-6 mt-4">
                  {[
                    { t: "Weekly Alignment", d: "Automated check-ins that keep the team focused." },
                    { t: "Progress Velocity", d: "Track how fast you are moving towards key results." }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-muted/30 rounded-2xl border border-border/20 hover:bg-muted/50 transition-colors">
                      <h4 className="font-bold text-foreground mb-1">{item.t}</h4>
                      <p className="text-sm text-muted-foreground">{item.d}</p>
                    </div>
                  ))}
                </div>
            </div>

            {/* Feature 3 - Decision Log */}
            <div id="decisions" className="md:col-span-12 bg-foreground text-background rounded-[2.5rem] p-10 md:p-20 relative overflow-hidden animate-slide-up group" style={{ animationDelay: '0.5s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                   <div>
                     <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-10">
                        <ClipboardList className="h-8 w-8 text-primary" />
                     </div>
                     <h2 className="text-5xl md:text-6xl  font-medium tracking-tight mb-8">Decision Log</h2>
                     <p className="text-xl text-background/80 font-medium mb-12 max-w-lg leading-relaxed">
                       Static documentation is dead. TaskLyne creates a living, searchable record of every decision made, ensuring team members have context on day one.
                     </p>
                     <Button className="rounded-full px-10 h-16 bg-primary text-white hover:bg-primary/90 font-bold shadow-2xl transition-transform hover:scale-[1.03]">
                        Get Started Today <Zap className="ml-3 h-5 w-5" />
                     </Button>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      {[
                        { title: "SAML/SSO", icon: <ShieldCheck className="h-6 w-6 text-primary" /> },
                        { title: "Soc 2 Type II", icon: <ShieldCheck className="h-6 w-6 text-primary" /> },
                        { title: "256-bit AES", icon: <ShieldCheck className="h-6 w-6 text-primary" /> },
                        { title: "Zero Data Training", icon: <Zap className="h-6 w-6 text-primary" /> },
                      ].map((card, i) => (
                        <div key={i} className="p-8 bg-background/5 border border-background/10 rounded-3xl backdrop-blur-md flex flex-col items-center text-center group-hover:bg-background/10 transition-colors">
                           {card.icon}
                           <span className="mt-4 font-bold tracking-tight text-lg">{card.title}</span>
                        </div>
                      ))}
                   </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-40 px-6 text-center border-t border-border/10 bg-muted/5 relative">
         <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl  font-medium tracking-tight mb-12">Capture the future <br /><span className="text-muted-foreground">of your startup.</span></h2>
            <Link 
              href="/signup" 
              className="rounded-full px-12 h-16 bg-foreground text-background font-bold text-xl hover:bg-foreground/90 transition-all flex items-center hover:scale-[1.02] shadow-xl"
            >
              Join the Beta <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
         </div>
      </section>
    </main>
  )
}




