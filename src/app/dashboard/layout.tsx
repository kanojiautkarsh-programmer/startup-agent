import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | TaskLyne",
  description: "The central command center for your high-growth startup operations."
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
