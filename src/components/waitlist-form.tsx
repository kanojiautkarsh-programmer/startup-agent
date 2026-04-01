"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export function WaitlistForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError("")

    try {
      // First check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // User is logged in, add to waitlist with their profile
        const { error } = await supabase.from('waitlist').insert({
          email: user.email,
          name: user.user_metadata?.full_name || name || null,
          user_id: user.id
        })
        
        if (error && error.code !== '23505') {
          throw error
        }
      } else {
        // Add to waitlist without user_id
        const { error } = await supabase.from('waitlist').insert({
          email: email.trim(),
          name: name.trim() || null
        })
        
        if (error && error.code !== '23505') {
          throw error
        }
      }

      setSuccess(true)
      setTimeout(() => {
        if (!user) {
          router.push('/signup')
        }
      }, 1500)
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        setSuccess(true)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">You&apos;re on the list!</h3>
        <p className="text-muted-foreground">We&apos;ll be in touch soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {email ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12"
            />
            <Input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
            {loading ? "Joining..." : "Join Waitlist"}
          </Button>
        </>
      ) : (
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  )
}
