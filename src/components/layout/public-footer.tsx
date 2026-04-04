import Link from "next/link"
import { Brain, Twitter, Linkedin, Github } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="py-24 px-6 bg-[#0A0B0C] text-[#F8F9FA] border-t border-primary/20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_bottom,rgba(255,100,0,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12 lg:gap-16 mb-20 animate-fade-in">
          <div className="lg:col-span-3 flex flex-col pr-0 md:pr-12">
            <Link href="/" className="flex items-center gap-3 mb-8 group" aria-label="TaskLyne Home">
              <span className="font-extrabold text-3xl md:text-4xl tracking-tighter text-white hover:opacity-80 transition-opacity">TaskLyne</span>
            </Link>
            <p className="text-zinc-400 max-w-sm mb-12 text-lg font-medium leading-relaxed">
              Scale your startup intelligence with the only AI command center built for high-growth teams.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'GitHub' }
              ].map((social, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer group/icon shadow-xl backdrop-blur-sm"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-zinc-400 group-hover/icon:text-primary group-hover/icon:scale-110 transition-all" />
                </a>
              ))}
            </div>
          </div>
  
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-widest mb-8 text-white/90">Product</h4>
            <ul className="space-y-4 text-base font-medium text-zinc-400">
              <li><Link href="/features" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Security</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Integrations</Link></li>
            </ul>
          </div>
  
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-widest mb-8 text-white/90">Company</h4>
            <ul className="space-y-4 text-base font-medium text-zinc-400">
              <li><Link href="/about" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Contact</Link></li>
            </ul>
          </div>
  
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-widest mb-8 text-white/90">Legal</h4>
            <ul className="space-y-4 text-base font-medium text-zinc-400">
              <li><Link href="/privacy" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">Cookie Policy</Link></li>
              <li><Link href="/dpa" className="hover:text-primary transition-all hover:translate-x-0.5 inline-block">DPA</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-8">
           <p className="text-sm font-medium text-zinc-500 tabular-nums">
             &copy; {new Date().getFullYear()} TaskLyne Inc. Built for operational clarity.
           </p>
           <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,90,0,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Systems Operational</span>
           </div>
        </div>
      </div>
    </footer>
  )
}

