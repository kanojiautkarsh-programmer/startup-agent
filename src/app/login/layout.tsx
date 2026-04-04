import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your TaskLyne account to access your startup's command center."
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
