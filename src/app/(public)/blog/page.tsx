import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

export default function BlogPage() {
  const posts = [
    {
      title: "TaskLyne: Scaling Intelligence with Startup Context",
      date: "April 3, 2026",
      readTime: "5 min read",
      category: "Launch",
      excerpt: "Today, we're officially launching TaskLyne. A unified AI command center built for the founders who need clarity at every step."
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
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-6 bg-primary" />
            <span className="font-serif italic text-2xl text-muted-foreground tracking-tight">The Lab Note</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-8">Ideas, intelligence, <br /><span className="italic font-normal">and velocity.</span></h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Stories from the frontier of startup operations, decision theory, and AI context management.
          </p>
        </div>

        <div className="space-y-16 mb-24 animate-slide-up">
          {posts.map((post, idx) => (
            <Link key={idx} href="#" className="group block glass-card border border-border/40 rounded-[2.5rem] p-10 md:p-14 hover:border-primary/40 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 md:mt-0 font-medium">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 leading-tight group-hover:text-primary transition-colors">{post.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">{post.excerpt}</p>
              <div className="flex items-center text-sm font-bold uppercase tracking-widest text-primary group-hover:gap-2 transition-all">
                Read Article <ArrowUpRight className="ml-2 h-4 w-4" />
              </div>
            </Link>
          ))}
          
          <div className="text-center py-24 glass-card border border-dashed border-border/60 rounded-[2.5rem]">
             <p className="text-xl text-muted-foreground font-serif italic mb-2">More insights coming soon.</p>
             <p className="text-sm font-medium text-muted-foreground/50 tabular-nums">Quarterly updates from the command center.</p>
          </div>
        </div>
      </div>
    </div>
  )
}