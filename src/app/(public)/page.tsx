import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight, Upload, Search } from "lucide-react"

export default function Home() {
  return (
    <div className="bg-background">
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-32 px-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-3 h-3 bg-foreground" aria-hidden="true"></span>
              <span className="font-serif italic text-2xl md:text-3xl text-muted-foreground tracking-tight">Scale your intelligence</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-[5.5rem] font-medium tracking-tighter leading-[1.05] mb-10 max-w-5xl text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
              The only AI command center built for high-growth startups
            </h1>
            
            <p className="text-2xl text-muted-foreground mb-14 max-w-3xl mx-auto leading-snug text-pretty">
              Our platform unifies your goals, decisions, and knowledge base. Delivering clarity, efficiency and speed at every step.
            </p>
            
            <Button size="lg" asChild className="rounded-full px-10 h-16 text-xl bg-gradient-to-r from-orange-400 via-orange-500 to-accent-orange text-black font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 border-0">
              <Link href="/demo">See it in action <ArrowRight className="ml-2 h-6 w-6" aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-24 px-6 bg-foreground">
          <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Bento Block 1 - Large */}
            <div className="md:col-span-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 rounded-bento p-12 md:p-16 flex flex-col justify-between overflow-hidden relative group shadow-sm border border-indigo-100/50">
              <div className="relative z-10 max-w-xl">
                <span className="font-serif italic text-xl md:text-2xl text-foreground/60 mb-6 block text-balance">Memory Storage</span>
                <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-tight text-foreground mb-6 text-balance">
                  Upload it.<br />We&apos;ll organize it.
                </h2>
                <Button variant="ghost" className="rounded-full px-0 hover:bg-transparent font-medium text-lg hover:text-accent-orange group-hover:translate-x-2 transition-transform duration-300 focus-visible:ring-1 focus-visible:ring-ring rounded">
                  Explore Knowledge Hub <ArrowUpRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
              
              {/* Mock UI */}
              <div className="mt-16 bg-card rounded-3xl p-8 border border-border/50 shadow-sm relative z-10 w-full max-w-2xl translate-y-8 group-hover:translate-y-4 transition-transform duration-500 ease-out">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-orange rounded-xl flex items-center justify-center">
                      <Upload className="h-6 w-6 text-black" aria-hidden="true" />
                    </div>
                    <span className="text-xl font-medium">Recent Intake</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground tabular-nums">3 files processed</span>
                </div>
                <div className="space-y-4">
                  {[
                    "Q3_Board_Deck_Final.pdf",
                    "Engineering_Roadmap_2026.docx",
                    "Stripe_Integration_Notes.txt"
                  ].map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-muted rounded-2xl">
                      <span className="font-medium truncate mr-4">{doc}</span>
                      <span className="px-3 py-1 bg-background text-xs font-semibold rounded-full uppercase tracking-wider tabular-nums whitespace-nowrap">Auto-tagged</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Block 2 - Small */}
            <div className="md:col-span-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 rounded-bento p-12 flex flex-col justify-between overflow-hidden relative group shadow-sm border border-amber-100/50">
              <div className="relative z-10">
                <span className="font-serif italic text-xl md:text-2xl text-foreground/60 mb-6 block text-balance">Smart Search</span>
                <h2 className="text-5xl font-medium tracking-tighter leading-tight text-foreground mb-6 text-balance">
                  Find answers instantly.
                </h2>
              </div>
              <div className="mt-12 group-hover:scale-105 transition-transform duration-500 ease-out origin-bottom">
                 <div className="bg-card w-full rounded-full p-4 flex items-center gap-4 shadow-sm">
                    <Search className="h-6 w-6 text-muted-foreground shrink-0 ml-2" aria-hidden="true" />
                    <div className="font-mono text-muted-foreground text-sm flex-1 truncate">
                      "What was our Q3 churn rate?"
                    </div>
                 </div>
                 <div className="mt-6 bg-accent-orange/10 border border-accent-orange/20 rounded-3xl p-6 text-sm text-foreground/80 leading-relaxed font-medium">
                    "Based on the Q3 Board Deck, your net revenue churn rate was <strong className="text-foreground tabular-nums">1.2%</strong>, an improvement from Q2."
                 </div>
              </div>
            </div>

            {/* Bento Block 3 - Small */}
            <div className="md:col-span-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 rounded-bento p-12 flex flex-col justify-between overflow-hidden group shadow-sm border border-teal-100/50">
               <div className="relative z-10 w-full">
                <span className="font-serif italic text-xl md:text-2xl text-foreground/60 mb-6 block text-balance">Goal Tracking</span>
                <h2 className="text-5xl font-medium tracking-tighter leading-tight text-foreground mb-6 text-balance">
                  Keep teams accountable.
                </h2>
                
                <div className="mt-12 space-y-6 w-full">
                  {[
                    { title: "Close Series A", progress: 85 },
                    { title: "Ship mobile app", progress: 40 },
                  ].map((goal, idx) => (
                    <div key={idx} className="w-full">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-lg">{goal.title}</span>
                        <span className="font-mono text-sm tabular-nums">{goal.progress}%</span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded-full w-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground rounded-full transition-transform origin-left duration-1000 ease-out"
                          style={{ transform: `scaleX(${goal.progress / 100})` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Block 4 - Large */}
            <div className="md:col-span-7 bg-gradient-to-tr from-rose-50 via-pink-50 to-purple-100 rounded-bento p-12 md:p-16 flex flex-col justify-center overflow-hidden shadow-sm border border-pink-100/50">
              <span className="font-serif italic text-xl md:text-2xl text-foreground/60 mb-6 block text-balance">Enterprise Security</span>
              <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-tight text-foreground mb-8 text-balance">
                Bank-grade protection for startup velocity.
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                {[
                  "SOC 2 Type II", "End-to-End Encrypted", "SSO & SAML", "Zero Data Training"
                ].map((feature, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                     <span className="w-2 h-2 bg-accent-orange rounded-full" aria-hidden="true"></span>
                     <span className="font-medium leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Testimonial Section inside Black wrapper */}
        <section className="py-32 px-6 bg-foreground text-background">
           <div className="max-w-[88rem] mx-auto text-center flex flex-col items-center">
             <h2 className="text-5xl sm:text-7xl font-medium tracking-tighter mb-16 max-w-4xl text-balance">
               Trusted by the most ambitious founding teams.
             </h2>
             <div className="grid md:grid-cols-3 gap-8 text-left w-full">
               {[
                  { quote: "TaskLyne completely removed operational friction. We make decisions 5x faster because context is truly centralized.", person: "Anonymous", role: "CEO, Series A Startup" },
                  { quote: "It’s like having a chief of staff that never sleeps, indexing every Slack message, document, and goal we set.", person: "Anonymous", role: "Technical Founder" },
                  { quote: "Investor updates that used to consume my entire weekend now take literally four minutes. Unbelievable UX.", person: "Anonymous", role: "CTO, Seed Stage Startup" },
               ].map((test, idx) => (
                 <div key={idx} className="bg-card/10 border border-border/20 rounded-3xl p-10 flex flex-col justify-between">
                   <p className="text-2xl leading-relaxed mb-12 font-medium text-pretty">&ldquo;{test.quote}&rdquo;</p>
                   <div>
                     <p className="font-semibold text-lg">{test.person}</p>
                     <p className="text-muted-foreground/60">{test.role}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 text-center">
           <div className="max-w-4xl mx-auto flex flex-col items-center">
               <div className="flex items-center gap-3 mb-10">
                 <span className="w-3 h-3 bg-accent-orange" aria-hidden="true"></span>
                 <span className="font-serif italic text-3xl text-muted-foreground tracking-tight">Setup in minutes</span>
               </div>
               <h2 className="text-7xl sm:text-[6rem] font-medium tracking-tighter mb-14 text-balance leading-none">
                 Ready to move faster?
               </h2>
               <Button size="lg" asChild className="rounded-full px-12 h-20 text-2xl bg-gradient-to-r from-gray-800 to-black text-background font-medium shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 border-0">
                 <Link href="/demo">Request demo <ArrowRight className="ml-3 h-6 w-6" aria-hidden="true" /></Link>
               </Button>
           </div>
        </section>
      </main>
    </div>
  )
}
