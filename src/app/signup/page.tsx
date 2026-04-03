'use client'

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleSignUp = async () => {
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&#)")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#2D211B] flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold leading-none">S</span>
          </div>
          <span className="font-serif font-medium text-lg tracking-tight">StartupAgent</span>
        </Link>
        <Link href="/login" className="text-muted-foreground text-sm hover:text-foreground transition-colors font-medium">
          Sign in instead
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-10 px-6 py-12">
        <div className="w-full max-w-[360px] mx-auto flex flex-col">
          
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium tracking-tight mb-3">
              Join <span className="italic font-normal">StartupAgent</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Start building your startup&apos;s memory
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <button 
            type="button"
            className="w-full rounded-full h-12 flex items-center justify-center border border-border bg-background hover:bg-muted/50 hover:border-foreground/30 transition-all font-medium text-sm text-foreground mb-6"
            onClick={handleGoogleSignUp} 
            disabled={loading}
          >
            <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-background px-3 text-muted-foreground">or email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Jane Doe" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="w-full px-5 h-12 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-foreground/50 transition-colors placeholder:text-muted-foreground"
              />
            </div>
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
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
            
            <p className="text-[11px] text-center text-muted-foreground/80 mt-6 mb-2">
              By joining, you agree to our <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link> and <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
            </p>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-full h-12 bg-[#2D211B] text-white hover:bg-[#2D211B]/90 font-medium transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted-foreground font-medium flex justify-center space-x-6">
        <span>© {new Date().getFullYear()} StartupAgent Intelligence Corp.</span>
      </footer>
    </div>
  )
}
