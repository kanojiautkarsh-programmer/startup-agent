"use client"

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function ConfirmContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const handleConfirmation = async () => {
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")
      const next = searchParams.get("next") ?? "/dashboard"

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        })

        if (error) {
          setStatus("error")
          setErrorMessage(error.message)
        } else {
          setStatus("success")
          setTimeout(() => {
            window.location.href = next
          }, 2000)
        }
      } else {
        const { error } = await supabase.auth.getSession()
        if (error || !supabase.auth.getSession()) {
          setStatus("error")
          setErrorMessage("Invalid confirmation link")
        } else {
          setStatus("success")
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 2000)
        }
      }
    }

    handleConfirmation()
  }, [searchParams, supabase])

  return (
    <div className="text-center max-w-md">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight font-medium mb-2">Confirming...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your email.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="h-12 w-12 mx-auto mb-6 text-green-500" />
          <h1 className="text-3xl font-bold tracking-tight font-medium mb-2">Email Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Redirecting you to your dashboard...</p>
          <Link href="/dashboard" className="text-primary hover:underline">
            Click here if not redirected
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-12 w-12 mx-auto mb-6 text-destructive" />
          <h1 className="text-3xl font-bold tracking-tight font-medium mb-2">Confirmation Failed</h1>
          <p className="text-muted-foreground mb-6">{errorMessage || "The confirmation link is invalid or has expired."}</p>
          <Link href="/login" className="text-primary hover:underline">
            Return to login
          </Link>
        </>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="text-center max-w-md">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight font-medium mb-2">Loading...</h1>
      <p className="text-muted-foreground">Please wait.</p>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <Suspense fallback={<LoadingFallback />}>
        <ConfirmContent />
      </Suspense>
    </div>
  )
}
