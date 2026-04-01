import Link from "next/link";

export default function CookiesPage() {
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
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: April 2, 2026
          </p>

          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit our
                website. They help us remember your preferences and improve your
                experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How We Use Cookies</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border mb-4">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Type</th>
                      <th className="border border-border p-3 text-left">Purpose</th>
                      <th className="border border-border p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Essential</td>
                      <td className="border border-border p-3">Authentication, Security</td>
                      <td className="border border-border p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Analytics</td>
                      <td className="border border-border p-3">Usage analytics (PostHog)</td>
                      <td className="border border-border p-3">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Essential Cookies</h2>
              <p>
                These cookies are necessary for the website to function properly. They
                enable core functionality such as security, authentication, and session
                management. You cannot opt out of essential cookies as the service
                would not function without them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Analytics Cookies</h2>
              <p className="mb-4">
                We use PostHog for analytics, which has the following characteristics:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Operates cookieless by default using localStorage</li>
                <li>Uses anonymized data</li>
                <li>Does not track users across websites</li>
                <li>No personal data collected without consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="mb-4">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  <strong>Google Fonts:</strong> For font delivery
                </li>
                <li>
                  <strong>Intercom:</strong> For in-app support (if enabled)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Choices</h2>
              <p className="mb-4">You can control cookies through:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your browser settings (block, delete, or limit cookies)</li>
                <li>Opting out of analytics via your account settings</li>
                <li>The cookie consent banner on first visit</li>
              </ul>
              <p>
                Note: Disabling cookies may affect the functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy periodically. Any changes will be posted
                on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, contact us at{" "}
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
          © 2026 All rights reserved.
        </div>
      </footer>
    </div>
  );
}
