import Link from "next/link"
import { ArrowLeft, Zap, Database, Slack, Github } from "lucide-react"

export default function IntegrationsPage() {
  const integrations = [
    { name: "Slack", icon: <Slack className="h-6 w-6" />, type: "Communication" },
    { name: "GitHub", icon: <Github className="h-6 w-6" />, type: "Dev Ops" },
    { name: "PostgreSQL", icon: <Database className="h-6 w-6" />, type: "Data" },
  ]

  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-center lg:text-left">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-20">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
            <Zap className="h-6 w-6 text-primary fill-primary" />
            <span className="font-serif italic text-2xl md:text-3xl text-muted-foreground">Powering your workflow</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-8">Connected intelligence.</h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            TaskLyne integrates with the tools you already use to capture context where it happens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-24">
          {integrations.map((int, idx) => (
             <div key={idx} className="glass-card border border-border/40 rounded-[2rem] p-10 flex flex-col items-center justify-center group hover:border-primary/40 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {int.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{int.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">{int.type}</span>
             </div>
          ))}
          <div className="glass-card border border-dashed border-border/60 rounded-[2rem] p-10 flex items-center justify-center animate-pulse">
             <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">More Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}




