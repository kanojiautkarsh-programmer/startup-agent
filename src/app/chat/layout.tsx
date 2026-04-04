import { Metadata } from "next";
import { DesktopOnly } from "@/components/layout/desktop-only";

export const metadata: Metadata = {
  title: "AI Chat | TaskLyne",
  description: "Consult with your AI Chief of Staff. Retrieve context and make better decisions faster."
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopOnly>
      {children}
    </DesktopOnly>
  );
}
