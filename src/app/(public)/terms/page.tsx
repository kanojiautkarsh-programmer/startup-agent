import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        
        <div className="mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-8">Terms of Service</h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium italic">
            Effective Date: April 3, 2026.
          </p>
        </div>

        <div className="prose prose-lg prose-invert max-w-none text-muted-foreground space-y-12 animate-slide-up">
          <section>
            <h2 className="text-3xl font-serif text-white mb-6">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using the TaskLyne platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">2. Description of Service</h2>
            <p className="leading-relaxed">
              TaskLyne provides an AI-powered command center for startups, including goal tracking, decision logging, and context management tools. We reserve the right to modify or discontinue any part of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">3. User Responsibilities</h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the service only for lawful purposes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">4. Intellectual Property</h2>
            <p className="leading-relaxed">
              The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of TaskLyne Inc. and its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">5. Limitation of Liability</h2>
            <p className="leading-relaxed">
              In no event shall TaskLyne, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">6. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
