'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { User, Key, CreditCard, Shield, Check, Zap, Building, Star, CreditCard as CardIcon } from 'lucide-react';

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
];

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
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('starter');

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    setTimeout(() => {
      setCurrentPlan(planId);
      setLoading(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          {/* Settings Navigation */}
          <div className="w-64 border-r border-border/50 bg-background/50 h-[calc(100vh-3.5rem)] sticky top-14 p-6 hidden md:block">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 px-4">Settings</h2>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-4 rounded-full px-4 py-3 text-sm transition-all font-medium ${
                      isActive 
                        ? "bg-foreground text-background shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 max-w-5xl">
            <div className="mb-10">
              <h1 className="text-4xl font-serif text-foreground font-medium tracking-tight mb-2">
                Plan <span className="italic font-normal">& Billing</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground tracking-wide">Manage your subscription constraints.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-12">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const isPro = plan.id === 'pro';
                
                return (
                  <div key={plan.id} className={`bg-background rounded-[2rem] border overflow-hidden flex flex-col transition-all relative ${isPro ? 'border-foreground/30 shadow-sm md:-translate-y-2' : 'border-border/60 hover:border-foreground/20'}`}>
                    {isPro && (
                      <div className="bg-foreground text-background text-center py-1.5 text-[10px] uppercase font-bold tracking-widest w-full top-0 absolute">
                        Most Popular
                      </div>
                    )}
                    <div className={`p-8 ${isPro ? 'pt-10' : ''}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isPro ? 'bg-foreground border-foreground text-background' : 'bg-muted/50 border-border'}`}>
                           <plan.icon className="h-4 w-4" />
                        </div>
                        <div>
                           <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                           {isCurrent && <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D211B] bg-[#2D211B]/10 px-2 py-0.5 rounded-full inline-block mt-1">Current</span>}
                        </div>
                      </div>
                      
                      <div className="mb-6 h-12">
                         <p className="text-xs text-muted-foreground font-medium leading-relaxed">{plan.description}</p>
                      </div>
                      
                      <div className="mb-8">
                         <div className="text-4xl font-serif font-medium tracking-tight">
                           ${plan.price}
                           {plan.price > 0 && <span className="text-sm font-sans font-medium text-muted-foreground">/mo</span>}
                         </div>
                      </div>

                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 font-medium">
                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="px-8 pb-8 mt-auto">
                      <button 
                        className={`w-full rounded-full h-11 font-medium text-sm transition-colors ${
                          isCurrent 
                            ? 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-border/50' 
                            : isPro 
                              ? 'bg-[#2D211B] text-white hover:bg-[#2D211B]/90' 
                              : 'bg-background border border-border hover:bg-muted text-foreground'
                        }`}
                        disabled={isCurrent || loading !== null}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {loading === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-8 bg-background border border-border/60 rounded-[2rem] p-8 hover:border-foreground/20 transition-colors shadow-sm">
               <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/40">
                 <div>
                   <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full border border-border bg-muted/20 flex items-center justify-center shrink-0">
                       <CardIcon className="h-4 w-4" />
                     </div>
                     Payment Method
                   </h2>
                   <p className="text-sm text-muted-foreground font-medium ml-[3.25rem] mt-1">Manage your payment methods and options.</p>
                 </div>
                 <button className="rounded-full px-6 h-10 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-colors text-center hidden md:block">
                   Add Method
                 </button>
               </div>
               
               <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-muted/10">
                 <div className="flex items-center gap-5">
                   <div className="w-14 h-9 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-[10px] font-bold tracking-widest shadow-sm">
                     VISA
                   </div>
                   <div>
                     <p className="font-semibold text-sm font-mono tracking-wide">•••• •••• •••• 4242</p>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Expires 12/25</p>
                   </div>
                 </div>
                 <button className="rounded-full px-5 h-9 border border-border bg-background hover:bg-muted font-medium text-xs uppercase tracking-wider transition-colors">
                   Update
                 </button>
               </div>
            </div>

            <div className="bg-background border border-border/60 rounded-[2rem] p-8 hover:border-foreground/20 transition-colors shadow-sm">
               <div className="mb-8 border-b border-border/40 pb-6">
                 <h2 className="text-xl font-semibold tracking-tight mb-2">Billing History</h2>
                 <p className="text-sm text-muted-foreground font-medium">View and download your past invoices.</p>
               </div>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 px-2 hover:bg-muted/30 rounded-xl transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                       <span className="font-serif font-medium">$</span>
                     </div>
                     <div>
                       <p className="font-semibold text-sm mb-1">Pro Plan - Monthly</p>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">March 1, 2024</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-6 pr-2">
                     <span className="font-semibold font-mono text-sm tracking-wide">$29.00</span>
                     <button className="text-xs uppercase font-bold tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors group-hover:text-foreground">
                       Download
                     </button>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 px-2 hover:bg-muted/30 rounded-xl transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                       <span className="font-serif font-medium">$</span>
                     </div>
                     <div>
                       <p className="font-semibold text-sm mb-1">Pro Plan - Monthly</p>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">February 1, 2024</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-6 pr-2">
                     <span className="font-semibold font-mono text-sm tracking-wide">$29.00</span>
                     <button className="text-xs uppercase font-bold tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors group-hover:text-foreground">
                       Download
                     </button>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
