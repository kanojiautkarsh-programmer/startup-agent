import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        
        <div className="mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-8">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium italic">
            Last updated: April 3, 2026.
          </p>
        </div>

        <div className="prose prose-lg prose-invert max-w-none text-muted-foreground space-y-12 animate-slide-up">
          <section>
            <h2 className="text-3xl font-serif text-white mb-6">Introduction</h2>
            <p className="leading-relaxed">
              At TaskLyne, we take your privacy seriously. This policy explains how we collect, use, and protect your data when you use our platform. Our core principle is that your data is yours—we build the intelligence to help you scale, not to harvest your startup's context.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">Data Collection</h2>
            <p className="leading-relaxed">
              We collect information that you provided directly (e.g., when you create an account, log your goals, or chat with our AI agents) and information collected automatically (e.g., usage patterns and performance logs).
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Account information: Name, email, company details.</li>
              <li>Operational data: Goals, decisions, and chat history.</li>
              <li>Technical data: IP address, browser type, device information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">How We Use Your Data</h2>
            <p className="leading-relaxed">
              TaskLyne uses your data to provide a personalized command center for your startup. This includes training our models on your specific context (local only) and identifying bottlenecks in your decision-making workflows.
            </p>
            <p className="mt-4 font-bold text-white">We never sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures, including end-to-end encryption in transit and rest. For more details, please visit our <Link href="/security" className="text-primary hover:underline">Security Page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-6">Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about our privacy practices, please contact our Data Protection Officer at privacy@tasklyne.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
