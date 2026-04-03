'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
      );

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif font-medium text-lg tracking-tight">TaskLyne</span>
        </Link>
        <Link href="/login" className="text-muted-foreground text-sm hover:text-foreground transition-colors font-medium">
          Back to Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-10 px-6">
        <div className="w-full max-w-[360px] mx-auto flex flex-col">
          
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight mb-3">
              Reset <span className="italic font-normal">access</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              We'll send you a link to reset your password.
            </p>
          </div>

          {sent ? (
             <div className="text-center space-y-6 bg-muted/20 border border-border rounded-3xl p-8">
               <div className="flex justify-center">
                 <CheckCircle2 className="h-12 w-12 text-[#2D211B]" />
               </div>
               <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                 We've sent a secure reset link to <strong>{email}</strong>.
                 Please check your inbox and spam folder.
               </p>
               <Link 
                 href="/login"
                 className="w-full rounded-full h-12 flex items-center justify-center border border-border bg-background hover:bg-muted/50 hover:border-foreground/30 transition-all font-medium text-sm text-foreground"
               >
                 <ArrowLeft className="h-4 w-4 mr-2" />
                 Back to Login
               </Link>
             </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 text-sm text-red-600 bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full px-5 h-12 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors placeholder:text-muted-foreground"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-full h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center mt-4"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted-foreground font-medium flex justify-center space-x-6">
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        <span>© {new Date().getFullYear()} TaskLyne Intelligence Corp.</span>
      </footer>
    </div>
  );
}
