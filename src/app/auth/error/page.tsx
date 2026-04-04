"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle } from "lucide-react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")

  const getErrorMessage = () => {
    if (error === "server_error") {
      return "We encountered a server error. Please try again."
    }
    if (error === "unauthorized") {
      return "You are not authorized to access this resource."
    }
    if (errorCode === " Callback URL mismatch") {
      return "The callback URL does not match the configured URL."
    }
    return error || "An unknown error occurred during authentication."
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <XCircle className="h-12 w-12 mx-auto mb-6 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight font-medium mb-2">Authentication Failed</h1>
        <p className="text-muted-foreground mb-2">{getErrorMessage()}</p>
        {errorCode && (
          <p className="text-xs text-muted-foreground mb-6">Error code: {errorCode}</p>
        )}
        <Link href="/login" className="text-primary hover:underline">
          Return to login
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 mx-auto mb-6 text-destructive" />
          <h1 className="text-3xl font-bold tracking-tight font-medium mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
