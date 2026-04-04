import Link from "next/link"
import { Metadata } from "next"

import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description: "Our commitment to data protection and GDPR compliance."
};

export default function DPAPage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl  font-medium tracking-tight mb-8">Data Processing Agreement (DPA)</h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium italic">Effective: April 3, 2026.</p>
        </div>
        <div className="prose prose-lg prose-invert max-w-none text-muted-foreground space-y-12">
          <p>This Data Processing Agreement (“DPA”) is between TaskLyne Inc. and the customer that has signed an Agreement for the purchase of Service from TaskLyne.</p>
          <section>
            <h2 className="text-3xl  text-white mb-6">GDPR Compliance</h2>
            <p>TaskLyne acknowledges its obligations under the General Data Protection Regulation (GDPR) and other applicable data protection laws. We act as a Data Processor for the Personal Data provided by our customers.</p>
          </section>
          <section>
            <h2 className="text-3xl  text-white mb-6">Data Security</h2>
            <p>We maintain comprehensive technical and organizational security measures to protect Personal Data against unauthorized access, use, or disclosure. For details, see our <Link href="/security" className="text-primary hover:underline">Security Whitepaper</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}




