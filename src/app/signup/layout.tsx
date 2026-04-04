import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | TaskLyne",
  description: "Start scaling your startup intelligence today for free."
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
