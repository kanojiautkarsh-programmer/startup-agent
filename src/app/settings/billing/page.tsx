'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { 
  User, 
  Key, 
  CreditCard, 
  Shield, 
  Check, 
  Zap, 
  Building, 
  Star, 
  CreditCard as CardIcon,
  ChevronRight,
  TrendingUp,
  Download,
  Plus,
  ArrowRight,
  Plug,
  BookOpen,
  Rocket,
} from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Profile", href: "/settings", icon: User },
  { title: "Startup Profile", href: "/settings/startup", icon: Rocket },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Integrations", href: "/settings/integrations", icon: Plug },
  { title: "Knowledge Base", href: "/settings/documents", icon: BookOpen },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "Security", href: "/settings/security", icon: Shield },
];

const plans = [
  {
    id: 'starter',
    name: 'Starter Engine',
    price: 0,
    description: 'Protocol foundation for individual operators.',
    features: ['5 internal sessions / day', 'Base vector memory', '3 strategic objectives', 'Identity verification'],
    icon: Zap,
  },
  {
    id: 'pro',
    name: 'Pro Cluster',
    price: 29,
    description: 'Advanced compute for high-frequency workflows.',
    features: ['Unlimited session throughput', 'Advanced persistence layers', 'Unlimited objectives', 'Priority routing', 'Custom node integrations'],
    icon: Star,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Grid',
    price: 99,
    description: 'Dedicated infrastructure for organizations.',
    features: ['Everything in Pro', 'SSO / Ledger Auth', 'Audit logs', 'API Endpoint access', 'Dedicated strategist', 'Custom context retention'],
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
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={{}} />
      <Header onOpenCommand={() => setCommandOpen(true)} sidebarCollapsed={sidebarCollapsed} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main className={`pt-14 transition-all duration-300 ${sidebarCollapsed ? "pl-16" : "pl-60"}`}>
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          {/* Settings Navigation */}
          <div className="w-72 border-r border-border/40 bg-muted/5 h-[calc(100vh-3.5rem)] sticky top-14 p-8 hidden lg:block animate-slide-in-left">
            <div className="flex items-center gap-3 mb-10 px-4">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">Command Center</h2>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                      "flex items-center justify-between group rounded-2xl px-5 h-12 text-sm transition-all font-medium border",
                      isActive 
                        ? "bg-[#2D211B] text-white border-transparent shadow-xl translate-x-2" 
                        : "text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground hover:border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground/60")} />
                      <span className={cn(isActive && "font-bold tracking-tight")}>{item.title}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </Link>
                )
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-border/40 px-4">
               <div className="glass-card rounded-2xl p-6 bg-primary/5 border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                     <TrendingUp className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Resource Usage</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">You have consumed <span className="font-bold text-foreground">84%</span> of your monthly compute cycles.</p>
                  <Link href="/settings/billing" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center group">
                     Scale Core <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-16 max-w-6xl">
            <div className="mb-16 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-serif text-foreground font-medium tracking-tight mb-4">
                Finance <span className="italic font-normal text-muted-foreground/60">& Quota</span>
              </h1>
              <div className="flex items-center gap-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Subscription constraints active</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-start">
              {plans.map((plan, planIdx) => {
                const isCurrent = currentPlan === plan.id;
                const isPro = plan.id === 'pro';
                
                return (
                  <div key={plan.id} className={cn(
                    "glass-card rounded-[3.5rem] border overflow-hidden flex flex-col transition-all relative animate-slide-up group",
                    isPro ? 'border-primary/40 shadow-2xl md:-translate-y-4 bg-primary/[0.02]' : 'border-border/40 hover:border-primary/20 hover:shadow-xl'
                  )} style={{ animationDelay: `${planIdx * 0.1}s` }}>
                    {isPro && (
                      <div className="bg-[#2D211B] text-white text-center py-2 text-[10px] uppercase font-bold tracking-[0.3em] w-full top-0 absolute">
                        Optimum Engine
                      </div>
                    )}
                    <div className={cn("p-10", isPro ? "pt-14" : "")}>
                      <div className="flex items-center gap-6 mb-8">
                        <div className={cn(
                            "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 border shadow-xl transition-all duration-500 group-hover:scale-110",
                            isPro ? 'bg-[#2D211B] border-[#2D211B] text-white' : 'bg-white border-border text-[#2D211B]'
                        )}>
                           <plan.icon className="h-6 w-6" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-serif font-medium tracking-tight">{plan.name}</h3>
                           {isCurrent && (
                             <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] uppercase font-bold tracking-widest text-green-600">Active</span>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed mb-10 h-10">{plan.description}</p>
                      
                      <div className="mb-10">
                         <div className="text-5xl font-serif font-medium tracking-tight">
                           ${plan.price}
                           {plan.price > 0 && <span className="text-lg font-sans font-medium text-muted-foreground/40 ml-1">/mo</span>}
                         </div>
                      </div>

                      <ul className="space-y-4 mb-10 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-4 text-sm text-foreground/80 font-medium">
                            <div className="w-5 h-5 rounded-full bg-green-500/5 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button 
                        className={cn(
                          "w-full rounded-full h-14 font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95",
                          isCurrent 
                            ? 'bg-muted border border-border/60 text-muted-foreground/60 cursor-not-allowed' 
                            : isPro 
                              ? 'bg-foreground text-background hover:bg-primary' 
                              : 'bg-white border border-border/60 hover:bg-foreground hover:text-background hover:border-transparent text-foreground'
                        )}
                        disabled={isCurrent || loading !== null}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {loading === plan.id ? (
                           <div className="flex items-center justify-center gap-2">
                              <TrendingUp className="h-4 w-4 animate-spin" />
                              <span>Processing...</span>
                           </div>
                        ) : isCurrent ? 'Active Engine' : plan.price === 0 ? 'Downgrade protocol' : 'Commence Upgrade'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
                   <div className="flex items-center justify-between mb-10 pb-10 border-b border-border/40">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl border border-border shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <CardIcon className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-serif font-medium tracking-tight">Payment Hub</h2>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Encrypted financial endpoints</p>
                        </div>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between p-8 border border-border/60 rounded-[2rem] bg-white group hover:border-primary/40 transition-all shadow-sm">
                     <div className="flex items-center gap-6">
                       <div className="w-16 h-10 bg-[#2D211B] rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-[0.3em] shadow-2xl">
                         CORE
                       </div>
                       <div>
                         <p className="font-bold text-base font-mono tracking-widest">•••• •••• •••• 4242</p>
                         <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40 mt-1">Expiry: 12 / 2026</p>
                       </div>
                     </div>
                     <button className="w-12 h-12 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-foreground hover:text-background transition-all shadow-sm">
                        <ChevronRight className="h-5 w-5" />
                     </button>
                   </div>
                   
                   <button className="w-full mt-8 h-14 rounded-full border border-border/60 border-dashed hover:border-primary/40 hover:bg-primary/[0.02] text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all flex items-center justify-center gap-3 active:scale-95 group">
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                      Add Payment Architecture
                   </button>
                </div>

                <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl animate-slide-up" style={{ animationDelay: '0.35s' }}>
                   <div className="flex items-center justify-between mb-10 pb-10 border-b border-border/40">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl border border-border shadow-xl flex items-center justify-center text-primary">
                            <TrendingUp className="h-7 w-7" />
                         </div>
                         <div>
                            <h2 className="text-3xl font-serif font-medium tracking-tight">Ledger Logs</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Historical financial records</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="space-y-4 max-h-[16rem] overflow-y-auto pr-4 custom-scrollbar">
                     {[
                       { date: 'March 01, 2024', amount: '29.00', id: 'IN-8241' },
                       { date: 'February 01, 2024', amount: '29.00', id: 'IN-7192' },
                       { date: 'January 01, 2024', amount: '29.00', id: 'IN-6031' },
                     ].map((invoice, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 px-4 hover:bg-primary/[0.02] border-b border-border/20 transition-colors group">
                         <div className="flex items-center gap-6">
                           <div className="w-10 h-10 rounded-full border border-border/60 bg-card flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
                             <Download className="h-4 w-4" />
                           </div>
                           <div>
                             <p className="font-bold text-sm mb-1">{invoice.id}</p>
                             <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40">{invoice.date}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-8">
                           <span className="font-bold font-mono text-sm tracking-tight">${invoice.amount}</span>
                           <button className="text-[9px] uppercase font-bold tracking-widest text-primary hover:underline underline-offset-4 opacity-0 group-hover:opacity-100 transition-all">
                             Export
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}




