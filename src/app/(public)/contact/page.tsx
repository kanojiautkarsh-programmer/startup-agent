import Link from "next/link"
import { Metadata } from "next"

import { Mail, MessageSquare, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the TaskLyne team for support or inquiries."
};

export default function ContactPage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-20">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-8">Get in touch</h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Whether you're scaling a Series A startup or architecting a new financial service, we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="glass-card border border-border/40 rounded-[2.5rem] p-12 hover:border-primary/40 transition-colors">
            <Mail className="h-8 w-8 text-primary mb-6" />
            <h2 className="text-2xl font-medium mb-4">Email us</h2>
            <p className="text-muted-foreground mb-6">For general inquiries and support.</p>
            <a href="mailto:hello@tasklyne.com" className="text-xl font-bold hover:text-primary transition-colors">hello@tasklyne.com</a>
          </div>

          <div className="glass-card border border-border/40 rounded-[2.5rem] p-12 hover:border-primary/40 transition-colors">
            <MessageSquare className="h-8 w-8 text-primary mb-6" />
            <h2 className="text-2xl font-medium mb-4">Chat with sales</h2>
            <p className="text-muted-foreground mb-6">Learn how TaskLyne can help your team scale.</p>
            <Link href="/demo" className="text-xl font-bold hover:text-primary transition-colors">Book a demo →</Link>
          </div>
        </div>

        <div className="glass-card border border-border/40 rounded-[2.5rem] p-12 md:p-16">
          <h2 className="text-3xl font-medium mb-12">Send us a message</h2>
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <input type="text" className="w-full h-14 bg-muted/20 border border-border/40 rounded-2xl px-6 focus:outline-none focus:border-primary/40 transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
                <input type="email" className="w-full h-14 bg-muted/20 border border-border/40 rounded-2xl px-6 focus:outline-none focus:border-primary/40 transition-colors" placeholder="john@company.com" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
              <textarea className="w-full h-40 bg-muted/20 border border-border/40 rounded-[2rem] p-6 focus:outline-none focus:border-primary/40 transition-colors resize-none" placeholder="Tell us about your startup..." />
            </div>
            <Button className="h-16 px-10 rounded-full text-lg font-bold bg-primary text-white hover:bg-primary/90 flex items-center gap-3">
              Send Message <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
