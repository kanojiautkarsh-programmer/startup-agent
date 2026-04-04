import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your startup context and initialize TaskLyne."
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
