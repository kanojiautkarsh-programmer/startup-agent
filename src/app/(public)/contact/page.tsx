import Link from "next/link"
import { ArrowLeft, Mail, MapPin, MessageSquare } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-20">
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-8">Get in touch</h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Whether you're scaling a Series A startup or architecturalizing a new financial service, we're here to help.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="glass-card border border-border/40 rounded-[2.5rem] p-12">
            <Mail className="h-8 w-8 text-primary mb-6" />
            <h2 className="text-2xl font-serif font-medium mb-4">Email us</h2>
            <p className="text-muted-foreground mb-6">For general inquiries and support.</p>
            <a href="mailto:hello@tasklyne.com" className="text-xl font-bold hover:text-primary transition-colors">hello@tasklyne.com</a>
          </div>
          <div className="glass-card border border-border/40 rounded-[2.5rem] p-12">
            <MessageSquare className="h-8 w-8 text-primary mb-6" />
            <h2 className="text-2xl font-serif font-medium mb-4">Sales</h2>
            <p className="text-muted-foreground mb-6">For enterprise plans and custom demos.</p>
            <a href="mailto:sales@tasklyne.com" className="text-xl font-bold hover:text-primary transition-colors">sales@tasklyne.com</a>
          </div>
        </div>
      </div>
    </div>
  )
}
