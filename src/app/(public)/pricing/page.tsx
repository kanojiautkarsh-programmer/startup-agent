import Link from "next/link"
import { Check, HelpCircle, ArrowRight, Zap, Target, Brain, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for solo founders building the foundation.",
      features: [
        "10 Active Goals",
        "30-day AI Memory",
        "Weekly Accountability Reports",
        "Community Support",
        "Basic Search"
      ],
      buttonText: "Start for Free",
      href: "/signup",
      popular: false
    },
    {
      name: "Pro",
      price: "$49",
      description: "For high-growth teams that need deep context.",
      features: [
        "Unlimited Active Goals",
        "Infinite AI Memory",
        "Daily Accountability Reviews",
        "Priority Email Support",
        "Semantic Decision Search",
        "Internal Knowledge Export"
      ],
      buttonText: "Get Pro Access",
      href: "/signup",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Scale-ready security and custom AI intelligence.",
      features: [
        "Everything in Pro",
        "Custom LLM Fine-tuning",
        "SAML/SSO Integration",
        "Dedicated Account Manager",
        "SOC 2 Type II Reports",
        "Custom Data Training Policy"
      ],
      buttonText: "Talk to Sales",
      href: "/demo",
      popular: false
    }
  ]

  const faqs = [
    { q: "How does AI Memory work?", a: "TaskLyne captures context from your conversations and decisions, building a searchable knowledge graph so you never lose the 'why' behind your work." },
    { q: "Is my data used for training?", a: "No. On all paid plans, we have a zero-data-training policy. Your context remains your own and is never shared or used to train general models." },
    { q: "Can I cancel at any time?", a: "Yes. TaskLyne is a month-to-month service, and you can cancel or downgrade your plan at any time from your settings." },
    { q: "Do you offer startup discounts?", a: "We do! Seed-stage startups may be eligible for a 50% discount for the first year. Contact our sales team to learn more." }
  ]

  return (
    <main className="w-full flex-1 bg-background overflow-hidden pb-32">
      {/* Hero */}
      <section className="pt-48 pb-20 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10 animate-fade-in" />
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-6xl sm:text-7xl font-serif font-medium tracking-tight mb-8 animate-slide-up">
            Transparent pricing <br /><span className="italic font-normal">for every stage.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80 font-medium max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Choose the plan that matches your startup's velocity. From seed to scale, TaskLyne has you covered.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`glass-card rounded-[2.5rem] p-10 flex flex-col border transition-all duration-500 animate-slide-up ${
                tier.popular ? "border-primary/40 shadow-2xl scale-[1.05] relative z-10 bg-card/80" : "border-border/40 bg-card/60"
              }`}
              style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-10">
                <h3 className="text-2xl font-serif font-bold mb-4">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-serif font-medium tracking-tighter">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground font-medium">/mo</span>}
                </div>
                <p className="mt-4 text-muted-foreground font-medium leading-relaxed">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground/80 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                asChild 
                className={`w-full h-14 rounded-full text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  tier.popular ? "bg-primary text-white hover:bg-primary/90 shadow-xl" : "bg-foreground text-background"
                }`}
              >
                <Link href={tier.href}>{tier.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Link */}
      <section className="py-12 px-6 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
          Need custom deployment or specialized compliance? 
          <Link href="/demo" className="text-primary hover:underline font-bold inline-flex items-center">
            Contact Sales <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </p>
      </section>

      {/* FAQs */}
      <section className="py-40 px-6 bg-muted/5 border-t border-border/10 mt-20 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-20 text-center animate-slide-up">Frequently Asked <span className="italic font-normal">Questions</span></h2>
          <div className="grid md:grid-cols-2 gap-12">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-4 animate-slide-up" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold tracking-tight mb-2">{faq.q}</h4>
                    <p className="text-muted-foreground leading-relaxed font-medium">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center animate-slide-up" style={{ animationDelay: '1s' }}>
         <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight mb-12">Ready to ship with <br /><span className="italic font-normal">total clarity?</span></h2>
            <Link 
              href="/signup" 
              className="rounded-full px-16 h-20 bg-foreground text-background font-bold text-2xl hover:bg-foreground/90 transition-all flex items-center hover:scale-[1.02] shadow-2xl"
            >
              Start Your Free Trial
            </Link>
         </div>
      </section>
    </main>
  )
}