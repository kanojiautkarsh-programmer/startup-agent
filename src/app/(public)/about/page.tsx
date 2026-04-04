import Link from "next/link"
import { Metadata } from "next"

import { Sparkles, Target, Zap, Brain, Quote, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet the team behind TaskLyne and our mission to empower founders."
};

export default function AboutPage() {
  const values = [
    {
      title: "Clarity first",
      description: "We believe that complexity is the enemy of growth. Our tools are designed to filter noise and reveal what truly matters.",
      icon: <Sparkles className="h-6 w-6 text-primary" />
    },
    {
      title: "Built for speed",
      description: "In a startup, velocity is everything. TaskLyne is engineered to be invisible, fast, and frictionless.",
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      title: "Persistent Memory",
      description: "Teams change, but context shouldn't. We provide the permanent record for your startup's most critical thinking.",
      icon: <Brain className="h-6 w-6 text-primary" />
    }
  ]

  return (
    <main className="w-full flex-1 bg-background overflow-hidden pb-40">
      {/* Hero */}
      <section className="pt-64 pb-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10 animate-fade-in" />
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight mb-12 animate-slide-up">
            The memory of <br /><span className="text-muted-foreground">a thousand startups.</span>
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed font-medium max-w-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            We're building the infrastructure for startup intelligence—centralizing every goal, decision, and pivot into a single source of truth.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-6 bg-muted/10 border-y border-border/40 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
             <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">Our Mission</span>
             <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight">
               Founder context is the most <span className="italic">valuable and volatile</span> asset in any high-growth company.
             </h2>
             <div className="prose prose-1xl md:prose-2xl text-pretty text-muted-foreground font-medium leading-relaxed space-y-8 max-w-none">
                <p>
                  Every day, founders make a hundred decisions. Most of them are lost to Slack threads, Notion docs, and fading memories. When a team scales, that lost context becomes friction. New hires don't know the "why", and errors are repeated.
                </p>
                <p>
                  TaskLyne was founded to solve this volatility. By using AI to capture and thread context naturally, we create a permanent, searchable memory for your company. So you can focus on building, while we handle the remembering.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <div 
                key={i} 
                className="glass-card rounded-[2.5rem] p-12 flex flex-col animate-slide-up"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-6">{value.title}</h3>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-40 px-6 relative bg-card text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
            <Quote className="h-16 w-16 text-primary/40 mb-12 animate-slide-up" />
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-16 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              &ldquo;The best founders aren't just fast; they are <span className="italic">intellectually persistent.</span> We built TaskLyne for them.&rdquo;
            </h2>
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
               <div className="w-20 h-20 bg-primary/20 rounded-full mb-6 border-2 border-primary/40 overflow-hidden flex items-center justify-center text-3xl font-bold tracking-tighter text-primary">
                  UK
               </div>
               <p className="font-bold text-xl">Utkarsh Kanojia</p>
               <p className="text-primary font-bold tracking-widest uppercase text-sm mt-1">Founder, TaskLyne</p>
            </div>
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="py-40 px-6 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
         <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-12">Want to build the <br /><span className="text-muted-foreground">future of memory?</span></h2>
            <Link 
              href="/careers" 
              className="text-primary font-bold text-2xl hover:underline transition-all flex items-center"
            >
              Check our open roles <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
         </div>
      </section>
    </main>
  )
}
