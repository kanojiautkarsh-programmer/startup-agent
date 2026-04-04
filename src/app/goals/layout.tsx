import { Metadata } from "next";
import { DesktopOnly } from "@/components/layout/desktop-only";

export const metadata: Metadata = {
  title: "Strategic Goals | TaskLyne",
  description: "Define, track, and achieve your startup's core objectives with AI-guided execution."
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopOnly>
      {children}
    </DesktopOnly>
  );
}
