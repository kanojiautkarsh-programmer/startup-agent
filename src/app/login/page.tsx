"use client"



export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col font-sans selection:bg-primary/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-card/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full px-8 py-8 flex items-center justify-between z-10 animate-slide-up">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-bold tracking-tight text-2xl tracking-tighter">TaskLyne</span>
        </Link>
        <Link href="/signup" className="text-xs uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          Create Account
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pb-20">
        <div className="w-full max-w-[420px] mx-auto flex flex-col animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground font-medium tracking-tight mb-4">
              Welcome <span className="text-muted-foreground text-muted-foreground/60">back</span>
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Log in to your account to continue
            </p>
          </div>

          <div className="premium-glass rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-8 p-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl text-center font-medium"
              >
                {error}
              </div>
            )}

            <button 
              type="button"
              className="w-full rounded-full h-14 flex items-center justify-center border border-border/60 bg-background hover:bg-muted/30 hover:border-foreground/20 transition-all font-bold text-xs uppercase tracking-widest text-foreground mb-8 group"
              onClick={handleGoogleSignIn} 
              disabled={loading}
            >
              <svg className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.3em]">
                <span className="bg-card/60 px-4 text-muted-foreground/40">or email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full px-6 h-14 rounded-full border border-border/60 bg-background/50 text-sm focus:outline-none focus:border-primary/50 transition-colors duration-150 placeholder:text-muted-foreground/30 font-medium"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label htmlFor="login-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                  <Link href="/forgot-password" className="text-[10px] text-muted-foreground/60 hover:text-foreground font-bold uppercase transition-colors mb-1">
                    Forgot?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full px-6 h-14 rounded-full border border-border/60 bg-background/50 text-sm focus:outline-none focus:border-primary/50 transition-colors duration-150 placeholder:text-muted-foreground/30 font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center mt-4 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log in to TaskLyne"}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold z-10 animate-slide-up">
        <div className="flex justify-center space-x-8 mb-4">
          <Link href="/login" className="hover:text-foreground transition-colors">Log in instead</Link>
          <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
        </div>
        <span>© {new Date().getFullYear()} TaskLyne Intelligence Systems</span>
      </footer>
    </div>
  )
}




