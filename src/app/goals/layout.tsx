import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goal Navigator | TaskLyne",
  description: "Track your OKRs and strategic milestones with automated accountability loops."
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
