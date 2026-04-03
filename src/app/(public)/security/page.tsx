import Link from "next/link"
import { Shield, Lock, Eye, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SecurityPage() {
  const sections = [
    {
      title: "Data Protection",
      icon: <Shield className="h-6 w-6 text-primary" />,
      content: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We maintain strict isolation between customer environments to ensure your data remains your own."
    },
    {
      title: "Infrastructure",
      icon: <Lock className="h-6 w-6 text-primary" />,
      content: "Our infrastructure is hosted on ISO 27001 and SOC 2 Type II certified cloud providers. We utilize multi-region backups and automated failover to ensure 99.9% availability."
    },
    {
      title: "Privacy by Design",
      icon: <Eye className="h-6 w-6 text-primary" />,
      content: "We never train our models on your private data without explicit consent. Your startup's internal context is siloed and accessible only to authorized members of your team."
    }
  ]

  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        
        <div className="mb-20 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-8">Security at TaskLyne</h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            We build for high-growth teams that can't afford to compromise on trust. Security isn't a feature; it's our foundation.
          </p>
        </div>

        <div className="grid gap-8 mb-24">
          {sections.map((section, idx) => (
            <div key={idx} className="glass-card border border-border/40 rounded-[2rem] p-10 md:p-12 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4 tracking-tight">{section.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-foreground text-background rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-8">Ready for enterprise scale?</h2>
            <p className="text-background/70 text-lg mb-10 max-w-xl">
              Download our full Security Whitepaper or request a SOC 2 Type II report from our compliance team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="rounded-full px-8 h-12 bg-background text-foreground hover:bg-background/90 font-semibold transition-all">
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button variant="outline" className="rounded-full px-8 h-12 border-background/20 text-background hover:bg-background/10 font-semibold transition-all">
                Request Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
