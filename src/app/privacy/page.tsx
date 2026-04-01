import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: April 2, 2026
          </p>

          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly:
              </p>
              <h3 className="font-medium mb-2">Account Information</h3>
              <p className="mb-4">
                When you sign up, we collect your name, email address, and optional
                profile information.
              </p>
              <h3 className="font-medium mb-2">Conversations</h3>
              <p className="mb-4">
                We store your chat messages, decisions, commitments, and goals you
                create within the service.
              </p>
              <h3 className="font-medium mb-2">API Keys</h3>
              <p className="mb-4">
                When you connect providers, your API key is encrypted and stored
                securely. We never access or use your API key except to facilitate
                your requests.
              </p>
              <h3 className="font-medium mb-2">Usage Data</h3>
              <p>
                We collect anonymized analytics about how you use the service to
                improve your experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide, maintain, and improve our service</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, investigate, and prevent fraudulent activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information
                to third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in operating our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit using TLS</li>
                <li>API keys encrypted at rest using AES-256</li>
                <li>Row-level security in our database</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data</li>
                <li>Export your data in a portable format</li>
                <li>Object to certain processing</li>
                <li>Withdraw consent</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@startupagent.io.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as
                needed to provide services. You may request deletion of your data at
                any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p>
                We use essential cookies for authentication and security. For analytics,
                we use PostHog which operates cookieless by default. See our Cookie
                Policy for more details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other
                than your own. We ensure appropriate safeguards are in place for such
                transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating
                the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us
                at:{" "}
                <a href="mailto:privacy@startupagent.io" className="text-primary">
                  privacy@startupagent.io
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
          © 2026 TaskLyne. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
