'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Zap, Building, Star } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    description: 'For individuals getting started',
    features: ['5 conversations/day', 'Basic memory', '3 goals', 'Email support'],
    icon: Zap,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'For power users',
    features: ['Unlimited conversations', 'Advanced memory', 'Unlimited goals', 'Priority support', 'Custom integrations'],
    icon: Star,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'For teams and organizations',
    features: ['Everything in Pro', 'SSO/SAML', 'Audit logs', 'API access', 'Dedicated support', 'Custom retention'],
    icon: Building,
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('starter');

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    // Simulate subscription flow
    setTimeout(() => {
      setCurrentPlan(planId);
      setLoading(null);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPro = plan.id === 'pro';
          
          return (
            <Card key={plan.id} className={isPro ? 'border-primary shadow-lg' : ''}>
              {isPro && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <plan.icon className="h-5 w-5" />
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  ${plan.price}
                  {plan.price > 0 && <span className="text-muted-foreground text-sm font-normal">/month</span>}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={isCurrent ? 'secondary' : isPro ? 'default' : 'outline'}
                  disabled={isCurrent || loading !== null}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payment Method</CardTitle>
          </div>
          <CardDescription>
            Manage your payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <Button variant="outline" className="mt-4">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">March 1, 2024</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">$29.00</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Pro Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">February 1, 2024</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">$29.00</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
