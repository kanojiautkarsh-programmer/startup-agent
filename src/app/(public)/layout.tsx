import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground font-sans flex flex-col">
      <PublicHeader />
      <div className="flex-1 w-full flex flex-col items-stretch">
        {children}
      </div>
      <PublicFooter />
    </div>
  )
}




