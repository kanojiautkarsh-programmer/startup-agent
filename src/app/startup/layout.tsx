import { Metadata } from "next";
import { DesktopOnly } from "@/components/layout/desktop-only";

export const metadata: Metadata = {
  title: "Startup Profile | TaskLyne",
  description: "Configure your startup's core parameters, mission, and growth metrics."
};

export default function StartupLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopOnly>
      {children}
    </DesktopOnly>
  );
}
