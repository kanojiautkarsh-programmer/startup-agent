import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat | TaskLyne",
  description: "Consult with your AI Chief of Staff. Retrieve context and make better decisions faster."
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
