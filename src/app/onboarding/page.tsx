'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SKILLS = [
  "Advertising", "AI & Automation", "Branding",
  "Cybersecurity", "Fashion Design", "Financial",
  "Graphic Design", "Legal", "Marketing", "Operations",
  "Other", "People/HR", "Photography",
  "Product Design", "Product Management",
  "Public Speaking", "Sales", "Science & Chemistry",
  "Social Media", "UI/UX Design", "Videography",
  "Web Design", "Web Development", "Writing"
];

export default function OnboardingSkillsPage() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const maxSkills = 3;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < maxSkills) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleContinue = async () => {
    if (selectedSkills.length === 0) return;
    
    setLoading(true);
    
    try {
      // In a real app, you'd save these to the user's profile
      // For now, we'll just navigate to dashboard
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save skills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="font-bold tracking-[0.2em] text-sm uppercase">
          TaskLyne
        </Link>
        <button className="text-muted-foreground text-sm hover:text-foreground transition-colors">
          Need help?
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-20 px-6">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
          
          {/* Progress Bar Area */}
          <div className="w-full max-w-[320px] mb-8">
            <div className="h-[3px] w-full bg-muted flex relative">
              <div className="h-full bg-foreground w-1/2 absolute left-0 top-0"></div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-4 text-center">
              Step 3 of 6
            </p>
          </div>

          {/* Typography block */}
          <div className="mb-6 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight">
              What are you <br className="hidden md:block" />
              <span className="italic font-normal">really good</span> at?
            </h1>
            
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed mt-4">
              We&apos;ll prioritize potential matches with skills complementary to yours. You can always update these later from your account settings.
            </p>
          </div>

          <p className="text-muted-foreground text-sm mb-8 mt-2">
            Please choose up to {maxSkills}
          </p>

          {/* Skills Grid/Flex */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-xl">
            {SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              const isDisabled = !isSelected && selectedSkills.length >= maxSkills;
              
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  disabled={isDisabled}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    isSelected
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground/50'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {skill}
                </button>
              );
            })}
          </div>

          <Button 
            onClick={handleContinue}
            disabled={selectedSkills.length === 0 || loading}
            className="rounded-full px-10 h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Continue {selectedSkills.length > 0 && `(${selectedSkills.length})`}
          </Button>
          
          {selectedSkills.length === 0 && (
            <p className="text-muted-foreground text-sm mt-4">
              Select at least one skill to continue
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted-foreground font-medium">
        ©{new Date().getFullYear()} TaskLyne Inc. All rights reserved.
      </footer>
    </div>
  );
}
