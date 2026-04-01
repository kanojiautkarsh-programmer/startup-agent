import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: April 2, 2026
          </p>

          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using TaskLyne ("we," "us," or "our"), you agree to
                be bound by these Terms of Service. If you do not agree, do not use
                our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                TaskLyne provides a memory and accountability platform
                for startup founders. Our service helps you track decisions,
                commitments, goals, and provides intelligent conversations with
                persistent context.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To use our service, you must:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Be at least 18 years old</li>
                <li>Provide accurate information</li>
                <li>Keep your account credentials secure</li>
                <li>Notify us of any unauthorized access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. API Keys and User Content</h2>
              <p className="mb-4">
                <strong>API Keys:</strong> When you connect providers, you retain
                full ownership of your API keys. We encrypt and store keys securely
                but assume no liability for unauthorized use.
              </p>
              <p>
                <strong>User Content:</strong> You retain ownership of all data you
                input into the service. We use your content solely to provide the
                service to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Service Limitations</h2>
              <p className="mb-4">
                <strong>Important:</strong> Our features are provided "as is" with
                the following limitations:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Responses are generated automatically and may be inaccurate</li>
                <li>You are responsible for validating outputs</li>
                <li>Responses do not constitute professional advice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Payment Terms</h2>
              <p className="mb-4">
                Subscription fees are billed monthly or annually in advance. You can
                cancel anytime, and cancellations take effect at the end of your
                billing period.
              </p>
              <p>
                Refunds are provided at our discretion. Please contact support within
                7 days of payment if you believe a refund is warranted.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
              <p>
                The service, including all software, designs, and content, is owned by
                TaskLyne and protected by intellectual property laws. You may not
                copy, modify, or distribute our intellectual property without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Acceptable Use</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the service for illegal purposes</li>
                <li>Attempt to access other users' data</li>
                <li>Reverse engineer or extract our technology</li>
                <li>Send spam or abusive content</li>
                <li>Violate any applicable laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Termination</h2>
              <p>
                We may suspend or terminate your account if you violate these terms or
                engage in harmful behavior. You may cancel your account at any time
                through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, STARTUP AGENT SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU
                PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO
                NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
                ERROR-FREE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by the laws of the State of Delaware,
                United States, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">13. Dispute Resolution</h2>
              <p>
                Any disputes shall be resolved through binding arbitration in Delaware,
                USA. By using our service, you consent to arbitration and waive any
                right to participate in class actions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">14. Contact Information</h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a href="mailto:legal@startupagent.io" className="text-primary">
                  legal@startupagent.io
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <div className="flex justify-center gap-4 mb-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:underline">
              Cookie Policy
            </Link>
          </div>
          © 2026 All rights reserved.
        </div>
      </footer>
    </div>
  );
}
