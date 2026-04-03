'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Brain, 
  Target, 
  Zap, 
  Users, 
  Shield,
  Search,
  Plus
} from 'lucide-react';

const SKILLS = [
  "Advertising", "AI & Automation", "Branding",
  "Cybersecurity", "Financial", "Legal", "Marketing", 
  "Operations", "Product Design", "Product Management",
  "Sales", "UI/UX Design", "Web Development", "Writing"
];

const STAGES = [
  "Ideation", "Pre-seed", "Seed", "Series A", "Series B+"
];

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', icon: Zap },
  { id: 'notion', name: 'Notion', icon: Brain },
  { id: 'github', name: 'GitHub', icon: Zap },
  { id: 'linear', name: 'Linear', icon: Target },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initPercent, setInitPercent] = useState(0);

  // Form State
  const [orgName, setOrgName] = useState('');
  const [orgStage, setOrgStage] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>(['', '', '']);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const supabase = createClient();

  const totalSteps = 6;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 3) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const updateGoal = (index: number, val: string) => {
    const newGoals = [...goals];
    newGoals[index] = val;
    setGoals(newGoals);
  };

  const toggleIntegration = (id: string) => {
    if (selectedIntegrations.includes(id)) {
      setSelectedIntegrations(selectedIntegrations.filter(i => i !== id));
    } else {
      setSelectedIntegrations([...selectedIntegrations, id]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    let progress = 0;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
          progress = 90;
          clearInterval(interval);
        }
        setInitPercent(Math.floor(progress));
      }, 100);

      await supabase
        .from('profiles')
        .update({
          company: orgName,
          funding_stage: orgStage,
          skills: selectedSkills,
          onboarding_completed: true,
          onboarding_data: {
            integrations: selectedIntegrations,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', user.id);

      setInitPercent(40);

      const goalsToInsert = goals
        .filter(g => g.trim())
        .map((g, i) => ({
          user_id: user.id,
          title: g,
          status: 'active',
          priority: i === 0 ? 'high' : 'medium',
          quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
        }));

      if (goalsToInsert.length > 0) {
        await supabase.from('goals').insert(goalsToInsert);
      }

      setInitPercent(70);

      if (selectedIntegrations.includes('notion')) {
        await supabase.from('integrations').upsert({
          user_id: user.id,
          provider: 'notion',
          status: 'pending'
        }).select().single();
      }

      await supabase.auth.updateUser({
        data: { onboarding_completed: true }
      });

      setInitPercent(100);
      setTimeout(() => router.push('/dashboard'), 400);
    } catch (error) {
      console.error('Onboarding error:', error);
      setLoading(false);
      router.push('/dashboard');
    }
  };

  // Step names for progress
  const stepNames = ["Welcome", "Vision", "Expertise", "Strategy", "Context", "Launch"];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent-orange/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#2D211B]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Top Navigation */}
      <header className="w-full px-8 py-8 flex items-center justify-between z-20 sticky top-0 bg-white/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-full bg-[#2D211B] flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-[#2D211B]/20">
            <span className="text-white text-xs font-bold leading-none">S</span>
          </div>
          <span className="font-serif font-medium text-xl tracking-tight">StartupAgent</span>
        </Link>
        <div className="flex flex-col items-end gap-1">
           <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-full border border-border/40">
              {[...Array(totalSteps)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-700 ease-out border border-white/40 ${i + 1 <= step ? 'w-8 bg-[#2D211B] shadow-sm' : 'w-2 bg-muted'}`} 
                />
              ))}
           </div>
           <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pr-2">
             {stepNames[step - 1]} &middot; 0{step}
           </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        
        {/* Main Glassmorphic Card */}
        <div className="w-full max-w-2xl bg-white/60 backdrop-blur-2xl border border-white p-1 md:p-1.5 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          <div className="bg-white rounded-[2.8rem] border border-border/40 p-8 md:p-14 min-h-[520px] flex flex-col">
            
            {/* STEP 1: WELCOME INTRO */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both flex-1 flex flex-col items-center text-center justify-center space-y-10">
                 <div className="relative">
                    <div className="absolute inset-0 bg-accent-orange/20 rounded-full blur-2xl animate-pulse" />
                    <div className="w-24 h-24 bg-[#2D211B] rounded-[2.5rem] flex items-center justify-center relative shadow-2xl animate-bounce-slow">
                        <Brain className="text-white h-12 w-12" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-serif text-foreground font-medium tracking-tight leading-[0.95]">
                      Welcome to <br />
                      <span className="italic font-normal text-muted-foreground/80">Intelligence.</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed font-medium">
                      Your autonomous Chief of Staff is ready to help you capture every decision of your startup journey.
                    </p>
                 </div>
                 <Button 
                  onClick={nextStep}
                  className="rounded-full px-16 h-16 bg-[#2D211B] text-white hover:bg-black font-medium text-xl shadow-2xl hover:shadow-[#2D211B]/20 group transition-all"
                >
                  Start Onboarding <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}

            {/* STEP 2: VISION / ORG */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex-1 flex flex-col space-y-12">
                 <div className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                       <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight leading-tight">
                      First, your <br />
                      <span className="italic font-normal text-[#2D211B]">organization.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">I'll map all memory and context to this entity.</p>
                 </div>
                 
                 <div className="space-y-10">
                    <div className="space-y-4 relative group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80 ml-1">Startup Name</label>
                      <input 
                        autoFocus
                        placeholder="e.g. Acme Corp" 
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full h-18 text-2xl font-serif border-b border-border bg-transparent pb-4 focus:outline-none focus:border-[#2D211B] transition-all placeholder:text-muted-foreground/30"
                      />
                      <div className="absolute bottom-0 left-0 h-0.5 bg-[#2D211B] w-0 group-focus-within:w-full transition-all duration-700 ease-out" />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80 ml-1">Funding Stage</label>
                      <div className="flex flex-wrap gap-2">
                        {STAGES.map(stage => (
                          <button
                            key={stage}
                            onClick={() => setOrgStage(stage)}
                            className={`px-5 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${orgStage === stage ? 'bg-[#2D211B] text-white border-[#2D211B] shadow-lg shadow-[#2D211B]/20 scale-105' : 'bg-background hover:border-foreground/30 hover:bg-muted/10'}`}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4 mt-auto">
                    <Button variant="outline" onClick={prevStep} className="rounded-full h-14 w-14 shrink-0 transition-all hover:bg-muted/40"><ArrowLeft className="h-5 w-5" /></Button>
                    <Button 
                      onClick={nextStep}
                      disabled={!orgName || !orgStage}
                      className="flex-1 rounded-full h-14 bg-[#2D211B] text-white hover:bg-black font-medium text-lg shadow-xl shadow-[#2D211B]/10"
                    >
                      Continue
                    </Button>
                 </div>
              </div>
            )}

            {/* STEP 3: EXPERTISE */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex-1 flex flex-col space-y-12">
                 <div className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                       <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight leading-tight">
                      Tell me your <br />
                      <span className="italic font-normal text-[#2D211B]">superpowers.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">I'll augment your skills or assist in areas you lack. Select 1-3.</p>
                 </div>

                 <div className="flex flex-wrap gap-2 content-start">
                    {SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      const isMax = !isSelected && selectedSkills.length >= 3;
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          disabled={isMax}
                          className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${isSelected ? 'bg-accent-orange text-black border-accent-orange shadow-lg shadow-accent-orange/20' : 'bg-background hover:border-foreground/30 disabled:opacity-30'}`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                 </div>

                 <div className="flex gap-4 pt-4 mt-auto">
                    <Button variant="outline" onClick={prevStep} className="rounded-full h-14 w-14 shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
                    <Button 
                      onClick={nextStep}
                      disabled={selectedSkills.length === 0}
                      className="flex-1 rounded-full h-14 bg-[#2D211B] text-white hover:bg-black font-medium text-lg shadow-xl"
                    >
                      {selectedSkills.length > 0 ? `Expertise Locked (${selectedSkills.length})` : "Choose your skills"}
                    </Button>
                 </div>
              </div>
            )}

            {/* STEP 4: STRATEGIC GOALS */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex-1 flex flex-col space-y-12">
                 <div className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                       <Target className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight leading-tight">
                      Defining your <br />
                      <span className="italic font-normal text-[#2D211B]">north star.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Capture your primary objectives for this quarter.</p>
                 </div>

                 <div className="space-y-6">
                    {goals.map((goal, idx) => (
                      <div key={idx} className="relative group flex items-end">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D211B]/40 mb-3 w-8">0{idx + 1}</span>
                         <input 
                           placeholder={idx === 0 ? "e.g. Ship Beta to first 50 users" : "Add secondary goal..."}
                           value={goal}
                           onChange={(e) => updateGoal(idx, e.target.value)}
                           className="flex-1 h-12 bg-transparent border-b border-border focus:outline-none focus:border-[#2D211B] transition-all font-medium text-lg pb-2 placeholder:text-muted-foreground/30"
                         />
                         {goal && <div className="absolute right-0 bottom-3"><Check className="h-4 w-4 text-green-500" /></div>}
                         <div className="absolute bottom-0 left-8 right-0 h-[1px] bg-[#2D211B] w-0 group-focus-within:w-[calc(100%-2rem)] transition-all duration-700" />
                      </div>
                    ))}
                 </div>

                 <div className="flex gap-4 pt-4 mt-auto">
                    <Button variant="outline" onClick={prevStep} className="rounded-full h-14 w-14 shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
                    <Button 
                      onClick={nextStep}
                      disabled={!goals[0].trim()}
                      className="flex-1 rounded-full h-14 bg-[#2D211B] text-white hover:bg-black font-medium text-lg shadow-xl"
                    >
                      Set Objectives
                    </Button>
                 </div>
              </div>
            )}

            {/* STEP 5: INTELLIGENCE FEED */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex-1 flex flex-col space-y-12 text-center">
                 <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-4">
                       <Zap className="h-6 w-6 text-[#2D211B]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight leading-tight">
                      Feeding my <br />
                      <span className="italic font-normal text-muted-foreground/70">Context.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto">Select paths for my AI to monitor. I'll automatically capture decisions & tasks.</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {INTEGRATIONS.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleIntegration(item.id)}
                        className={`p-8 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 group ${selectedIntegrations.includes(item.id) ? 'bg-[#2D211B] border-[#2D211B] text-white shadow-xl shadow-[#2D211B]/10 -translate-y-1' : 'bg-background hover:bg-muted/10 hover:border-foreground/30 hover:shadow-md'}`}
                      >
                         <item.icon className="h-10 w-10 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.name}</span>
                         {selectedIntegrations.includes(item.id) ? (
                            <div className="px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-bold uppercase tracking-widest">Connected</div>
                         ) : (
                            <div className="px-2 py-0.5 bg-muted rounded-full text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Ready</div>
                         )}
                      </button>
                    ))}
                 </div>

                 <div className="flex gap-4 pt-4 mt-auto">
                    <Button variant="outline" onClick={prevStep} className="rounded-full h-14 w-14 shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
                    <Button 
                      onClick={nextStep}
                      className={`flex-1 rounded-full h-14 font-medium text-lg transition-all ${selectedIntegrations.length > 0 ? 'bg-[#2D211B] text-white hover:bg-black shadow-xl' : 'bg-muted/40 text-foreground/70 hover:bg-muted/60'}`}
                    >
                      {selectedIntegrations.length > 0 ? `Connect Intelligence Sources (${selectedIntegrations.length})` : "Skip for now"}
                    </Button>
                 </div>
              </div>
            )}

            {/* STEP 6: LAUNCH / INITIALIZING */}
            {step === 6 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both flex-1 flex flex-col space-y-12">
                 
                 {!loading ? (
                   <>
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                           <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight leading-tight">
                          Verification <br />
                          <span className="italic font-normal text-[#2D211B]">complete.</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium">Review your startup profile before we initialize the command center.</p>
                    </div>

                    <div className="bg-[#FAF9F6] border border-border/40 rounded-[2.5rem] p-8 space-y-8 shadow-inner">
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Startup Entity</p>
                              <p className="text-lg font-serif font-medium leading-none">{orgName}</p>
                              <p className="text-[10px] font-bold text-[#2D211B] uppercase tracking-widest">{orgStage} Stage</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Primary Focus</p>
                              <p className="text-sm font-medium text-[#2D211B] leading-relaxed italic">&ldquo;{goals[0]}&rdquo;</p>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-border/40">
                           <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Intelligence Feed</p>
                           <div className="flex flex-wrap gap-2">
                              {selectedIntegrations.length > 0 ? selectedIntegrations.map(i => (
                                <span key={i} className="px-3 py-1 bg-white border border-border shadow-sm rounded-full text-[9px] font-bold uppercase tracking-widest">{i}</span>
                              )) : <span className="text-[10px] text-muted-foreground italic">No external sources connected</span>}
                           </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 mt-auto">
                        <Button variant="outline" onClick={prevStep} className="rounded-full h-14 w-14 shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
                        <Button 
                          onClick={handleFinish}
                          className="flex-1 rounded-full h-16 bg-[#2D211B] text-white hover:bg-black font-medium text-xl shadow-2xl shadow-[#2D211B]/20"
                        >
                          Initialize Command Center
                        </Button>
                    </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-1000">
                      <div className="relative">
                         <div className="w-24 h-24 rounded-full border-4 border-muted/30" />
                         <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90">
                            <circle 
                              cx="48" cy="48" r="44" 
                              stroke="#2D211B" strokeWidth="4" fill="transparent"
                              strokeDasharray="276"
                              strokeDashoffset={276 - (276 * initPercent / 100)}
                              className="transition-all duration-300 ease-out"
                            />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold">
                            {initPercent}%
                         </div>
                      </div>
                      <div className="text-center space-y-4">
                         <h2 className="text-2xl font-serif font-medium tracking-tight h-8">
                            {initPercent < 30 ? "Booting cores..." : initPercent < 60 ? "Indexing startup context..." : initPercent < 90 ? "Calibrating Chief of Staff..." : "Ready to scale."}
                         </h2>
                         <div className="flex items-center gap-2 justify-center">
                            <span className="w-1.5 h-1.5 bg-[#2D211B] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1.5 h-1.5 bg-[#2D211B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 bg-[#2D211B] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-10 text-center relative z-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 font-medium">
          Powered by StartupAgent Intelligence Systems &middot; v0.42
        </p>
      </footer>
    </div>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
