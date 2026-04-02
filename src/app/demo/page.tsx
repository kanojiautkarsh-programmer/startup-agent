'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Brain, 
  Target, 
  Zap, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Conversations',
    description: 'Chat with an AI that remembers everything about you and your startup',
  },
  {
    icon: Brain,
    title: 'Persistent Memory',
    description: 'Automatically extracts decisions, commitments, and key context',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and track goals with deadlines and progress indicators',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Get AI-powered summaries and action items from your conversations',
  },
];

const testimonials = [
  {
    quote: "This has completely transformed how I run my startup. I actually remember all my decisions now!",
    author: "Sarah Chen",
    role: "Founder, TechStart",
  },
  {
    quote: "Finally an AI tool that doesn't forget. It's like having a second brain.",
    author: "Marcus Johnson",
    role: "CEO, GrowthLabs",
  },
];

export default function DemoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant. Ask me anything about your startup, and I'll remember it for you." }
  ]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    setLoading(true);
    const userMessage = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "That's a great question! Based on our previous conversations, I'd recommend focusing on validating your core assumption first. Want me to help you set up a goal for this?" 
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">StartupAgent</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Interactive Demo</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your AI-Powered<br />
              <span className="text-primary">Startup Memory</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience how StartupAgent remembers every decision, commitment, and insight 
              so you never lose context again.
            </p>
          </div>

          {/* Demo Chat */}
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Try it yourself</CardTitle>
                    <CardDescription>Chat with our AI - it remembers everything</CardDescription>
                  </div>
                  <Badge>{step}/3</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-80 overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-background border px-4 py-2 rounded-lg flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your startup, decisions, or goals..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  />
                  <Button onClick={handleChat} disabled={loading || !chatInput.trim()}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">What you get with StartupAgent</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="bg-background">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by founders</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-primary" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to never forget again?</h2>
          <p className="text-xl mb-8 opacity-90">Start for free, upgrade when you're ready.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Free
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                View Pricing
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-8 text-sm opacity-80">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              SOC 2 compliant
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              E2E encrypted
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>StartupAgent</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/security" className="hover:underline">Security</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
