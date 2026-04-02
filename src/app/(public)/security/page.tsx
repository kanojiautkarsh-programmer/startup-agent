import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Key, Eye, Database, FileCheck, Users } from "lucide-react";

export default function SecurityPage() {
  return (
    <main className="w-full flex-1">
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-5xl sm:text-7xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
              Security
            </h1>
          </div>
          <p className="text-xl text-muted-foreground/80 font-medium max-w-2xl">
            Enterprise-grade security built into every layer. Your data is protected with industry-leading encryption and compliance standards.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-cream border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>AES-256-GCM encryption protects your data at rest and in transit. Client-side encryption ensures only you can access your sensitive information.</p>
                <ul className="space-y-1.5 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Client-side key generation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Zero-knowledge architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Key rotation support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">SOC 2 Type II</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Our security controls are audited and certified annually against SOC 2 Type II standards, covering security, availability, and confidentiality.</p>
                <ul className="space-y-1.5 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Continuous monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Annual third-party audits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Incident response procedures
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">SSO & SAML</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Enterprise single sign-on with SAML 2.0 and OIDC support. Integrate with your identity provider for seamless, secure authentication.</p>
                <ul className="space-y-1.5 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    SAML 2.0 & OIDC protocols
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Okta, Azure AD, Ping support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Just-in-time provisioning
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <FileCheck className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Zero Data Training</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Your data is never used to train, fine-tune, or improve AI models. We have a strict no-training policy backed by contractual guarantees.</p>
                <ul className="space-y-1.5 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    No AI model training
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    No third-party data sharing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Vendor contract guarantees
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Database className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Clear data retention policies with configurable retention periods. Automatic deletion and anonymization of data according to your requirements.</p>
                <ul className="space-y-1.5 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Configurable retention periods
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Automatic data deletion
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Data export capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Eye className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Audit Logging</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Comprehensive audit logging of all account activity. Track access, changes, and security events with immutable audit trails.</p>
                <ul className="space-y-1.5 mt-4">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Immutable audit logs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Activity tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Security event monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium tracking-tight mb-4">Enterprise Security Features</h2>
          <p className="text-muted-foreground mb-12">
            Additional security features available for enterprise customers
          </p>
          <div className="grid gap-6 md:grid-cols-2 text-left">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Custom Data Retention</h3>
              <p className="text-sm text-muted-foreground">Configure custom data retention periods and deletion policies to meet your organizational requirements.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Dedicated Infrastructure</h3>
              <p className="text-sm text-muted-foreground">Isolated deployment with dedicated resources and enhanced isolation for maximum security.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">HIPAA Compliance</h3>
              <p className="text-sm text-muted-foreground">Healthcare-specific compliance including BAA agreements and additional safeguards for PHI.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Security Reviews</h3>
              <p className="text-sm text-muted-foreground">Regular security reviews, penetration testing, and vulnerability assessments included.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
