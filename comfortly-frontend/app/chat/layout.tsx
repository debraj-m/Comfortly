import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full h-full min-h-screen min-w-screen flex bg-[#1a1a1a] overflow-hidden">
      {children}
    </main>
  );
}
