'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Target,
  Rocket,
  Building,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Constants ──────────────────────────────────────── */

const STAGES = [
  { id: 'Ideation',  label: 'Ideation',  desc: 'Still validating the idea' },
  { id: 'Pre-seed',  label: 'Pre-seed',  desc: 'Building the first version' },
  { id: 'Seed',      label: 'Seed',      desc: 'Finding product-market fit' },
  { id: 'Series A',  label: 'Series A',  desc: 'Scaling what works' },
  { id: 'Series B+', label: 'Series B+', desc: 'Growth & expansion' },
];

const ROLES = [
  { id: 'founder-ceo',  label: 'Founder / CEO',       icon: Rocket },
  { id: 'cto',          label: 'CTO / Engineering',    icon: Zap },
  { id: 'product',      label: 'Product',              icon: Target },
  { id: 'marketing',    label: 'Marketing / Growth',   icon: TrendingUp },
  { id: 'sales',        label: 'Sales / BD',           icon: Building },
  { id: 'operations',   label: 'Operations / Finance', icon: Sparkles },
];

const INIT_MESSAGES = [
  'Initializing startup context…',
  'Setting strategic objectives…',
  'Calibrating AI assistant…',
  'Ready to scale.',
];

/* ─── Component ──────────────────────────────────────── */

export default function OnboardingPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [initPercent, setInitPercent] = useState(0);
  const [initMsgIdx,  setInitMsgIdx]  = useState(0);

  // Form state
  const [orgName,      setOrgName]      = useState('');
  const [orgStage,     setOrgStage]     = useState('');
  const [primaryRole,  setPrimaryRole]  = useState('');
  const [primaryGoal,  setPrimaryGoal]  = useState('');
  const [secondGoal,   setSecondGoal]   = useState('');

  const TOTAL_STEPS = 4;
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  /* Init & redirect */
  const handleFinish = async () => {
    setLoading(true);
    let progress = 0;
    let msgIdx   = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Animate progress bar
      const ticker = setInterval(() => {
        progress += Math.random() * 12 + 4;
        msgIdx = Math.floor((progress / 100) * INIT_MESSAGES.length);
        if (progress >= 95) { progress = 95; clearInterval(ticker); }
        setInitPercent(Math.floor(progress));
        setInitMsgIdx(Math.min(msgIdx, INIT_MESSAGES.length - 1));
      }, 120);

      // Persist profile
      await supabase.from('profiles').update({
        company:              orgName,
        funding_stage:        orgStage,
        skills:               [primaryRole],
        onboarding_completed: true,
        onboarding_data: {
          primary_role: primaryRole,
          completed_at: new Date().toISOString(),
        },
      }).eq('id', user.id);

      // Persist goals
      const goalsToInsert = [
        primaryGoal.trim() && { user_id: user.id, title: primaryGoal.trim(), status: 'active', priority: 'high',   quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}` },
        secondGoal.trim()  && { user_id: user.id, title: secondGoal.trim(),  status: 'active', priority: 'medium', quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}` },
      ].filter(Boolean);

      if (goalsToInsert.length) {
        await supabase.from('goals').insert(goalsToInsert);
      }

      await supabase.auth.updateUser({ data: { onboarding_completed: true } });

      clearInterval(ticker);
      setInitPercent(100);
      setInitMsgIdx(INIT_MESSAGES.length - 1);
      setTimeout(() => router.push('/dashboard'), 800);
    } catch {
      router.push('/dashboard');
    }
  };

  const stepLabel = ['Welcome', 'Your Startup', 'Your Role', 'Launch'][step - 1];

  return (
    <div className="min-h-dvh bg-background flex flex-col font-sans relative overflow-hidden selection:bg-primary/10">

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/4 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emphasis/5 blur-[120px]" />

      {/* ── Header ───────────────────────────────────── */}
      <header className="w-full px-8 py-6 flex items-center justify-between z-20 relative">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="TaskLyne home">
          <span
            className="flex size-8 items-center justify-center rounded-xl bg-emphasis text-emphasis-fg shadow-sm"
            aria-hidden="true"
          >
            <Zap className="size-4" />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight">TaskLyne</span>
        </Link>

        {/* Step dots */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/50 rounded-full border border-border/40">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500 ease-out',
                  i + 1 <= step ? 'w-8 bg-emphasis shadow-sm' : 'w-2 bg-muted-foreground/20'
                )}
              />
            ))}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground/50 pr-2">
            {stepLabel} · {String(step).padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">

        {/* Card shell */}
        <div className="w-full max-w-xl">
          <div className="bg-card border border-border/50 rounded-[2.5rem] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-8 md:p-12 min-h-[500px] flex flex-col" data-onboarding-step={step}>

              {/* ── STEP 1: WELCOME ──────────────────── */}
              {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-fade-in-up">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/15 rounded-full blur-2xl scale-150" aria-hidden="true" />
                    <div className="relative w-20 h-20 bg-emphasis rounded-[1.75rem] flex items-center justify-center shadow-xl">
                      <Zap className="size-9 text-emphasis-fg" />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight leading-[0.92] text-balance">
                      Welcome to<br />
                      <span className="italic font-normal text-muted-foreground/70">intelligence.</span>
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed font-medium max-w-sm mx-auto">
                      Your autonomous Chief of Staff — capturing decisions, tracking goals, and surfacing context exactly when you need it.
                    </p>
                  </div>

                  <button
                    onClick={next}
                    className="group flex items-center gap-3 rounded-full px-10 h-14 bg-emphasis text-emphasis-fg hover:opacity-90 font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Get started
                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </button>

                  <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                    Takes about 2 minutes
                  </p>
                </div>
              )}

              {/* ── STEP 2: STARTUP INFO ─────────────── */}
              {step === 2 && (
                <div className="flex-1 flex flex-col space-y-10 animate-fade-in-up">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center mb-5">
                      <Building className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-tight">
                      Tell me about<br />
                      <span className="italic font-normal text-primary">your startup.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                      I'll use this to personalise your context and intelligence feed.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Company name */}
                    <div className="space-y-3 group relative">
                      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 block" htmlFor="org-name">
                        Startup Name
                      </label>
                      <input
                        id="org-name"
                        autoFocus
                        placeholder="e.g. Acme Corp"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        className="w-full bg-transparent border-b-2 border-border pb-3 text-xl font-serif focus:outline-none focus:border-emphasis transition-colors duration-200 placeholder:text-muted-foreground/30"
                      />
                    </div>

                    {/* Stage */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 block">
                        Funding Stage
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                        {STAGES.map(stage => (
                          <button
                            key={stage.id}
                            onClick={() => setOrgStage(stage.id)}
                            className={cn(
                              'px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-150',
                              orgStage === stage.id
                                ? 'bg-emphasis text-emphasis-fg border-transparent shadow-md scale-[1.03]'
                                : 'bg-card hover:bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/20'
                            )}
                          >
                            {stage.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <NavButtons onPrev={prev} onNext={next} nextDisabled={!orgName.trim() || !orgStage} nextLabel="Continue" />
                </div>
              )}

              {/* ── STEP 3: ROLE + GOAL ──────────────── */}
              {step === 3 && (
                <div className="flex-1 flex flex-col space-y-8 animate-fade-in-up">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center mb-5">
                      <Target className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-tight">
                      Your role &<br />
                      <span className="italic font-normal text-primary">north star.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                      I'll calibrate my focus to what matters most to you.
                    </p>
                  </div>

                  {/* Role grid */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 block">
                      Your primary role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(role => {
                        const RoleIcon = role.icon;
                        const active   = primaryRole === role.id;
                        return (
                          <button
                            key={role.id}
                            onClick={() => setPrimaryRole(role.id)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all duration-150',
                              active
                                ? 'bg-emphasis text-emphasis-fg border-transparent shadow-md'
                                : 'bg-card hover:bg-muted/50 border-border/60 text-foreground hover:border-foreground/20'
                            )}
                          >
                            <RoleIcon className="size-4 shrink-0" aria-hidden="true" />
                            <span className="text-xs font-semibold leading-tight">{role.label}</span>
                            {active && <Check className="size-3.5 ml-auto shrink-0" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary goal */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 block" htmlFor="primary-goal">
                      #1 goal this quarter
                    </label>
                    <input
                      id="primary-goal"
                      placeholder="e.g. Ship beta to first 50 users"
                      value={primaryGoal}
                      onChange={e => setPrimaryGoal(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-border pb-3 text-base font-medium focus:outline-none focus:border-emphasis transition-colors duration-200 placeholder:text-muted-foreground/30"
                    />
                    {primaryGoal.trim() && (
                      <input
                        placeholder="Secondary goal (optional)"
                        value={secondGoal}
                        onChange={e => setSecondGoal(e.target.value)}
                        className="w-full bg-transparent border-b border-border/50 pb-3 text-sm font-medium focus:outline-none focus:border-emphasis/60 transition-colors duration-200 placeholder:text-muted-foreground/25 animate-fade-in"
                      />
                    )}
                  </div>

                  <NavButtons
                    onPrev={prev}
                    onNext={handleFinish}
                    nextDisabled={!primaryRole || !primaryGoal.trim()}
                    nextLabel="Launch my workspace"
                    nextIsFinish
                  />
                </div>
              )}

              {/* ── STEP 4: INITIALIZING ─────────────── */}
              {step === 4 && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-fade-in">
                  {/* Circular progress */}
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                      <circle cx="56" cy="56" r="50" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                      <circle
                        cx="56" cy="56" r="50"
                        stroke="hsl(var(--emphasis))"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={Math.PI * 2 * 50}
                        strokeDashoffset={Math.PI * 2 * 50 * (1 - initPercent / 100)}
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {initPercent >= 100
                        ? <Check className="size-8 text-emphasis animate-fade-in" aria-hidden="true" />
                        : <span className="font-serif text-2xl font-bold tabular-nums">{initPercent}%</span>
                      }
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-serif font-medium tracking-tight min-h-[2rem]">
                      {INIT_MESSAGES[initMsgIdx]}
                    </h2>
                    <div className="flex items-center gap-1.5 justify-center" aria-hidden="true">
                      <span className="size-1.5 rounded-full bg-emphasis/60 animate-wave" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 rounded-full bg-emphasis/60 animate-wave" style={{ animationDelay: '180ms' }} />
                      <span className="size-1.5 rounded-full bg-emphasis/60 animate-wave" style={{ animationDelay: '360ms' }} />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Skip link */}
          {step < 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-[11px] font-medium text-muted-foreground/40 hover:text-muted-foreground transition-colors underline underline-offset-2"
              >
                Skip setup and go straight to the app
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="w-full py-8 text-center relative z-20">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/25">
          TaskLyne · Your AI Chief of Staff
        </p>
      </footer>
    </div>
  );
}

/* ─── Nav buttons sub-component ─────────────────────── */

function NavButtons({
  onPrev,
  onNext,
  nextDisabled = false,
  nextLabel = 'Continue',
  nextIsFinish = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextIsFinish?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2 mt-auto">
      <button
        onClick={onPrev}
        aria-label="Go back"
        className="flex size-13 w-13 h-13 items-center justify-center rounded-full border border-border/60 bg-card hover:bg-muted/50 transition-colors shrink-0"
      >
        <ArrowLeft className="size-4 text-muted-foreground" aria-hidden="true" />
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          'flex-1 rounded-full h-13 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
          nextDisabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-emphasis text-emphasis-fg hover:opacity-90 shadow-lg hover:scale-[1.01] active:scale-[0.99]'
        )}
      >
        {nextLabel}
        {!nextIsFinish
          ? <ChevronRight className="size-4" aria-hidden="true" />
          : <Rocket className="size-4" aria-hidden="true" />
        }
      </button>
    </div>
  );
}
