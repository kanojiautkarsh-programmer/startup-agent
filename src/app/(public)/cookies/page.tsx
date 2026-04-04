import Link from "next/link"
import { Metadata } from "next"

import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Cookies",
  description: "Learn more about TaskLyne's Cookies."
};

export default function CookiePage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl  font-medium tracking-tight mb-8">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium italic">Last updated: April 3, 2026.</p>
        </div>
        <div className="prose prose-lg prose-invert max-w-none text-muted-foreground space-y-12">
          <section>
            <h2 className="text-3xl  text-white mb-6">How We Use Cookies</h2>
            <p>TaskLyne uses cookies and similar tracking technologies to track the activity on our Service and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>
          </section>
          <section>
            <h2 className="text-3xl  text-white mb-6">Managing Cookies</h2>
            <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>
          </section>
        </div>
      </div>
    </div>
  )
}




