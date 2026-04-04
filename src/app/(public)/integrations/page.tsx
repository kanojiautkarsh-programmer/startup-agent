import Link from "next/link"
import { Metadata } from "next"

import { ArrowLeft, Zap, Database, Slack, Github } from "lucide-react"

export const metadata: Metadata = {
  title: "Integrations",
  description: "Connect TaskLyne with Notion, Slack, and your existing stack."
};

function NotionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.513.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
    </svg>
  )
}

export default function IntegrationsPage() {
  const integrations = [
    { name: "Slack", icon: <Slack className="h-6 w-6" />, type: "Communication" },
    { name: "GitHub", icon: <Github className="h-6 w-6" />, type: "Dev Ops" },
    { name: "Notion", icon: <NotionIcon className="h-6 w-6" />, type: "Knowledge" },
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
            <span className=" italic text-2xl md:text-3xl text-muted-foreground">Powering your workflow</span>
          </div>
          <h1 className="text-5xl md:text-6xl  font-medium tracking-tight mb-8">Connected intelligence.</h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            TaskLyne integrates with the tools you already use to capture context where it happens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
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




