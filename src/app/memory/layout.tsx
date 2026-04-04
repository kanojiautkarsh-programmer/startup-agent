import { Metadata } from "next";
import { DesktopOnly } from "@/components/layout/desktop-only";

export const metadata: Metadata = {
  title: "AI Memory Hub | TaskLyne",
  description: "Access your startup's collective intelligence and search across every decision ever made."
};

export default function MemoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopOnly>
      {children}
    </DesktopOnly>
  );
}
