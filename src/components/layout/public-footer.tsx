import Link from "next/link"
import { Brain, Twitter, Linkedin, Github } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="py-20 md:py-32 px-6 bg-[#2D211B] text-white border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          <div className="lg:col-span-4 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-8 group" aria-label="TaskLyne Home">
              <span className="font-extrabold text-3xl md:text-4xl tracking-tighter hover:opacity-80 transition-opacity">TaskLyne</span>
            </Link>
            <p className="text-white/60 max-w-sm mb-10 text-lg md:text-xl font-medium leading-relaxed font-serif italic">
              Scale your startup intelligence with the only AI command center built for high-growth teams.
            </p>
            <div className="flex gap-4">
               <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer ring-1 ring-white/5 group/icon" aria-label="Twitter">
                 <Twitter className="h-4 w-4 text-white/50 group-hover/icon:text-primary transition-colors" />
               </a>
               <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer ring-1 ring-white/5 group/icon" aria-label="LinkedIn">
                 <Linkedin className="h-4 w-4 text-white/50 group-hover/icon:text-primary transition-colors" />
               </a>
               <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer ring-1 ring-white/5 group/icon" aria-label="GitHub">
                 <Github className="h-4 w-4 text-white/50 group-hover/icon:text-primary transition-colors" />
               </a>
            </div>
          </div>
  
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">Product</h4>
            <ul className="space-y-4 md:space-y-6 text-base md:text-lg font-medium">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
            </ul>
          </div>
  
          <div className="lg:col-span-2">
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">Company</h4>
            <ul className="space-y-4 md:space-y-6 text-base md:text-lg font-medium">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
  
          <div className="lg:col-span-3">
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">Legal</h4>
            <ul className="space-y-4 md:space-y-6 text-base md:text-lg font-medium">
              <li><Link href="/privacy" className="hover:text-primary transition-colors whitespace-nowrap">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors whitespace-nowrap">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors whitespace-nowrap">Cookie Policy</Link></li>
              <li><Link href="/dpa" className="hover:text-primary transition-colors whitespace-nowrap">DPA</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5">
           <p className="text-xs md:text-sm font-medium text-white/30 tabular-nums mb-6 md:mb-0">
             &copy; {new Date().getFullYear()} TaskLyne Inc. Designed with clarity.
           </p>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">System Operational</span>
           </div>
        </div>
      </div>
    </footer>
  )
}
