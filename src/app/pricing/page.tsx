import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Ignite",
    price: 49,
    description: "For solo founders",
    features: [
      "1 User",
      "50 captures/month",
      "Basic memory",
      "Weekly digest",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Accelerate",
    price: 149,
    description: "For growing startups",
    features: [
      "3 Users",
      "200 captures/month",
      "Full memory",
      "Daily nudges",
      "GTM strategy",
      "Investor prep",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Dominate",
    price: 399,
    description: "For scaling teams",
    features: [
      "10 Users",
      "Unlimited captures",
      "Full memory",
      "Real-time accountability",
      "Dedicated AI consultant",
      "SLA guarantee",
      "Custom integrations",
      "24/7 support",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <img src="https://i.ibb.co/nMYxk7XT/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that fits your stage
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-4 rounded-full border bg-muted p-1">
              <button className="rounded-full px-4 py-2 text-sm font-medium bg-background shadow-sm">
                Monthly
              </button>
              <button className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Annual
                <Badge variant="secondary" className="ml-2 text-xs">
                  -20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full mb-6"
                >
                  Get Started
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Can I change plans later?",
                  a: "Yes, you can upgrade or downgrade anytime. Changes take effect immediately.",
                },
                {
                  q: "What counts as a capture?",
                  a: "A capture is any item added to your memory — decisions, commitments, goals, or learnings.",
                },
                {
                  q: "Do users need to bring their own API keys?",
                  a: "Yes, users connect their own AI provider (Claude, Gemini) for maximum flexibility and cost control.",
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes! Start with a 14-day free trial on any plan. No credit card required.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
                },
              ].map((faq, i) => (
                <Card key={i} className="p-4">
                  <h4 className="font-medium mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
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
