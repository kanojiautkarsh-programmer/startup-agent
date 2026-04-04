import Link from "next/link"
import { Metadata } from "next"

import { ArrowLeft, Rocket, Users, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Careers",
  description: "Join TaskLyne and help us build the future of startup operations."
};

export default function CareersPage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-20">
          <h1 className="text-5xl md:text-6xl  font-medium tracking-tight mb-8  italic text-pretty">Build the command center <br />of the future.</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            We're a team of engineers, designers, and operators building the intelligence layer for high-growth startups.
          </p>
        </div>
        <div className="grid gap-8 mb-24">
          <div className="glass-card border border-border/40 rounded-[2.5rem] p-12 text-center py-20">
             <Rocket className="h-12 w-12 text-primary mx-auto mb-8" />
             <h2 className="text-3xl  font-medium mb-4">Launch our first cohort</h2>
             <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">We're currently scaling our core team. We prioritize builders who value clarity and velocity.</p>
             <p className="text-sm font-bold uppercase tracking-widest text-primary">Open roles coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}




