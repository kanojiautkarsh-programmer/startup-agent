'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use useEffect to check for access token hash in URL
  useEffect(() => {
    // Optional: add logic here if you need to parse the hash or check something on initial load
    // Supabase client usually handles the session automatically from the URL hash
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&#)');
      return;
    }

    setLoading(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
      );

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/login?message=password-reset-success');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif font-bold text-xl tracking-tight">TaskLyne</span>
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
              Set new <span className="italic font-normal">password</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Please enter your new secure password below.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-5 h-12 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors placeholder:text-muted-foreground"
              />
              <p className="text-[10px] text-muted-foreground ml-1 mt-1 font-medium">8+ chars, upper, lower, number, & special.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className="w-full px-5 h-12 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors placeholder:text-muted-foreground"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-full h-12 bg-emphasis text-emphasis-fg hover:bg-emphasis-hover font-medium transition-colors flex items-center justify-center mt-4"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
            </button>
          </form>

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




