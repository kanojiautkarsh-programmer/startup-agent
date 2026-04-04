import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | TaskLyne",
  description: "Securely access your AI-powered command center."
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
