import Link from "next/link"
import { Brain } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="py-20 px-6 border-t border-border bg-card text-foreground">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 flex flex-col justify-between">
          <Link href="/" className="flex items-center gap-3 mb-8" aria-label="TaskLyne Home">
            <span className="font-extrabold text-3xl tracking-tighter">TaskLyne</span>
          </Link>
          <p className="text-muted-foreground max-w-sm mb-12 text-pretty">
            The only AI support agent and command center built specifically for high-growth financial services and tech startups.
          </p>
          <p className="text-xs font-mono text-muted-foreground/60 tabular-nums">
            &copy; {new Date().getFullYear()} TaskLyne Inc. All rights reserved.
          </p>
        </div>

        <div className="lg:col-span-2 lg:col-start-7">
          <h4 className="font-semibold text-lg mb-6 tracking-tight">Product</h4>
          <ul className="space-y-4 font-medium text-muted-foreground">
            <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            <li><Link href="/security" className="hover:text-foreground transition-colors">Security</Link></li>
            <li><Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-semibold text-lg mb-6 tracking-tight">Company</h4>
          <ul className="space-y-4 font-medium text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-semibold text-lg mb-6 tracking-tight">Legal</h4>
          <ul className="space-y-4 font-medium text-muted-foreground">
            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            <li><Link href="/dpa" className="hover:text-foreground transition-colors">DPA</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
