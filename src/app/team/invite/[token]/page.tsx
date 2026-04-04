'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react'
import Link from 'next/link'

export default function TeamInvitePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (params.token) {
      fetchInvite()
    }
  }, [params.token])

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/team/invite/${params.token}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Invalid invitation')
      } else {
        setInvite(data.invite)
      }
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    setAccepting(true)
    try {
      const response = await fetch(`/api/team/invite/${params.token}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to accept invitation')
      }
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-serif font-medium mb-2">Invitation Invalid</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#2D211B] text-white"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-serif font-medium mb-2">Welcome to the team!</h1>
            <p className="text-muted-foreground mb-6">Redirecting you to the dashboard...</p>
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-muted/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#2D211B] mx-auto flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-medium mb-2">You're invited!</h1>
            <p className="text-muted-foreground">
              Join <span className="font-medium text-foreground">{invite?.teams?.name}</span> on TaskLyne
            </p>
          </div>

          <div className="bg-background rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Role</p>
            <p className="font-medium capitalize">{invite?.role}</p>
          </div>

          <button
            onClick={acceptInvite}
            disabled={accepting}
            className="w-full py-3 rounded-full bg-[#2D211B] text-white hover:bg-[#2D211B]/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              'Accept Invitation'
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            This invitation was sent to <span className="font-medium">{invite?.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
