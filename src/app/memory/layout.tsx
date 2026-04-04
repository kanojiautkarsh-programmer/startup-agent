import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Memory Hub | TaskLyne",
  description: "Access your startup\'s collective intelligence and search across every decision ever made."
};

export default function MemoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
