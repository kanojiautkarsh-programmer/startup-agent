import { Metadata } from "next";
import { DesktopOnly } from "@/components/layout/desktop-only";

export const metadata: Metadata = {
  title: "Client Portfolio | TaskLyne",
  description: "Manage your high-growth startup's customer base and strategic relationships."
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopOnly>
      {children}
    </DesktopOnly>
  );
}
