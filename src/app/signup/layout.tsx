import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a TaskLyne account and start building your startup's memory."
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
