import Link from "next/link"
import { Metadata } from "next"

import { Check, HelpCircle, ArrowRight, Zap, Target, Brain, ShieldCheck, Sparkles, Rocket, Activity, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Strategic Investment",
  description: "TaskLyne: Neural operations infrastructure for elite ventures. Premium autonomous intelligence at venture scale."
};

export default function PricingPage() {
  const tiers = [
    {
      name: "Founder",
      price: "$99",
      description: "Neural executive support for the solo operator.",
      features: [
        "Infinite Strategic Goals",
        "Full Neural Memory Indexing (100k nodes)",
        "Dedicated Autonomous Inference",
        "Priority Support Matrix",
        "Semantic Decision Intelligence",
        "Personal Onboarding Specialist"
      ],
      buttonText: "Initialize Instance",
      href: "/signup",
      popular: false
    },
    {
      name: "Growth",
      price: "$299",
      description: "Venture-scale team synchronization and shared workspaces.",
      features: [
        "Everything in Founder",
        "Neural Workspace for Teams (10 Seats)",
        "Shared Intelligence Indexing",
        "Infinite Autonomous Flow Matrix",
        "Venture Core Model Tuning",
        "Advanced Security Protocol",
        "Personalized Team Onboarding"
      ],
      buttonText: "Authorize Workspace",
      href: "/signup",
      popular: true
    },
    {
      name: "Venture",
      price: "$999",
      description: "Custom autonomous infrastructure at enterprise grade.",
      features: [
        "Everything in Growth",
        "Custom Neural Model Tuning",
        "Dedicated Compute Nodes",
        "SAML / SSO Identity Flow",
        "SOC 2 Type II Certification",
        "Air-Gapped Privacy Options",
        "White-Glove Implementation"
      ],
      buttonText: "Scale Intelligence",
      href: "/demo",
      popular: false
    }
  ]

  const faqs = [
    { q: "Why is the entry point $99?", a: "TaskLyne is not a generic tool; it's a dedicated neural infrastructure. Every 'Founder' instance is allocated dedicated compute resources to ensure absolute data privacy and instantaneous intelligence. This is a strategic investment in your operational velocity." },
    { q: "Is the Neural Archive private?", a: "TaskLyne provides a zero-trust architecture. Your startup context is never used for training global models and resides in an encrypted, private index that only you hold the keys to." },
    { q: "Can handles high-volume teams?", a: "Absolutely. The Growth tier is designed for rapid scaling ventures, providing unified team context that eliminates information silos and ensures the CEO's vision is synchronized." },
    { q: "Is there a refund policy?", a: "We offer a 14-day 'Operational Review'. If TaskLyne doesn't fundamentally improve your strategic output, we will decommission your instance and provide a full refund." }
  ]

  return (
    <main className="w-full flex-1 bg-background overflow-hidden pb-32">
      {/* Hero */}
      <section className="pt-48 pb-20 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8 bg-muted/40 px-5 py-2 rounded-full border border-border/40 animate-fade-in shadow-sm">
             <Globe className="size-3 text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Global Neural Infrastructure</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8 animate-slide-up">
            Strategic investment <br /><span className="text-muted-foreground/40 font-medium font-sans">for elite ventures.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80 font-medium max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Choose the tier that matches your operational intensity. TaskLyne provides the neural clarity required for high-velocity startups.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-12">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`rounded-[3.5rem] p-10 md:p-14 flex flex-col transition-all duration-500 animate-slide-up relative bg-card ${
                tier.popular 
                  ? "border-2 border-primary/60 shadow-2xl shadow-primary/20 scale-[1.05] z-10 premium-glass" 
                  : "border border-border/40 hover:border-primary/20 hover:shadow-2xl transition-all"
              }`}
              style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.25em] px-8 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
                  <Lock className="size-3.5" />
                  Elite Choice
                </div>
              )}
              
              <div className="mb-14">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-3xl font-bold tracking-tight">{tier.name}</h3>
                   <div className="size-12 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground/60 shadow-inner">
                     {idx === 0 ? <Rocket className="size-5" /> : idx === 1 ? <Target className="size-5" /> : <ShieldCheck className="size-5" />}
                   </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-7xl font-bold tracking-tighter tabular-nums">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground/40 font-bold text-sm tracking-widest uppercase">/mo</span>}
                </div>
                <p className="mt-8 text-muted-foreground/80 font-medium leading-relaxed">{tier.description}</p>
              </div>

              <div className="space-y-6 mb-16 flex-1">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-5 text-sm">
                    <Check className="size-5 text-primary shrink-0 p-1.5 bg-primary/10 rounded-full" />
                    <span className="text-foreground/90 font-medium tracking-tight leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                asChild 
                className={`w-full h-18 rounded-[2rem] text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  tier.popular ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/40" : "bg-foreground text-background"
                }`}
              >
                <Link href={tier.href}>{tier.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Contextual Value */}
      <section className="py-20 px-6 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
         <div className="max-w-2xl mx-auto p-12 rounded-[3.5rem] bg-primary/[0.02] border border-primary/10">
            <h4 className="text-xl font-bold tracking-tight mb-4">Dedicated Computing Power</h4>
            <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-lg mx-auto font-medium">
               Unlike legacy SaaS, TaskLyne allocates dedicated GPU-backed nodes to your workspace ensuring absolute zero data leakage and instantaneous semantic reflection.
            </p>
         </div>
      </section>

      {/* FAQs */}
      <section className="py-40 px-6 bg-muted/5 border-y border-border/10 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col items-center mb-24 space-y-4">
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center">Neural <span className="text-muted-foreground/40 font-medium">Archive Clearance</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-4 animate-slide-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <div className="flex items-start gap-5">
                  <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 uppercase shadow-sm">ID</div>
                  <div>
                    <h4 className="text-xl font-bold tracking-tight mb-3">{faq.q}</h4>
                    <p className="text-muted-foreground leading-relaxed font-medium text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center animate-slide-up" style={{ animationDelay: '1s' }}>
         <div className="max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tight mb-20 px-4">Neural <br /><span className="text-muted-foreground/40 font-medium font-sans">Initialization.</span></h2>
            <Link 
              href="/signup" 
              className="rounded-[2.5rem] px-20 h-24 bg-primary text-primary-foreground font-bold text-2xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-2xl shadow-primary/40 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              Initialize Context
              <ArrowRight className="ml-5 size-8 transition-transform group-hover:translate-x-3" />
            </Link>
            <p className="mt-12 text-muted-foreground/40 text-[11px] font-bold uppercase tracking-[0.4em]">Strategic cycle awaits.</p>
         </div>
      </section>
    </main>
  )
}
