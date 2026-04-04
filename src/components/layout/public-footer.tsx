import Link from "next/link"
import { Brain, Twitter, Linkedin, Github } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="py-20 md:py-24 px-6 bg-background text-foreground border-t border-border/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-3 flex flex-col pr-8">
            <Link href="/" className="flex items-center gap-3 mb-6 group" aria-label="TaskLyne Home">
              <span className="font-extrabold text-3xl md:text-4xl tracking-tighter hover:opacity-80 transition-opacity">TaskLyne</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-10 text-lg font-medium leading-relaxed">
              Scale your startup intelligence with the only AI command center built for high-growth teams.
            </p>
            <div className="flex gap-4">
               <a href="#" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-muted hover:border-border transition-all cursor-pointer group/icon" aria-label="Twitter">
                 <Twitter className="h-4 w-4 text-muted-foreground group-hover/icon:text-primary transition-colors" />
               </a>
               <a href="#" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-muted hover:border-border transition-all cursor-pointer group/icon" aria-label="LinkedIn">
                 <Linkedin className="h-4 w-4 text-muted-foreground group-hover/icon:text-primary transition-colors" />
               </a>
               <a href="#" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-muted hover:border-border transition-all cursor-pointer group/icon" aria-label="GitHub">
                 <Github className="h-4 w-4 text-muted-foreground group-hover/icon:text-primary transition-colors" />
               </a>
            </div>
          </div>
  
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-6 text-foreground">Product</h4>
            <ul className="space-y-4 text-base font-medium text-muted-foreground">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
            </ul>
          </div>
  
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-6 text-foreground">Company</h4>
            <ul className="space-y-4 text-base font-medium text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
  
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-6 text-foreground">Legal</h4>
            <ul className="space-y-4 text-base font-medium text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors whitespace-nowrap">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors whitespace-nowrap">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors whitespace-nowrap">Cookie Policy</Link></li>
              <li><Link href="/dpa" className="hover:text-primary transition-colors whitespace-nowrap">DPA</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/40 gap-6">
           <p className="text-sm font-medium text-muted-foreground tabular-nums">
             &copy; {new Date().getFullYear()} TaskLyne Inc. Designed with clarity.
           </p>
           <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-muted/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Operational</span>
           </div>
        </div>
      </div>
    </footer>
  )
}

