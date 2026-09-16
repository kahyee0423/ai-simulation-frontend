import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | AI Simulation Laboratory",
  description: "Register to access the AI Simulation Laboratory platform.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
