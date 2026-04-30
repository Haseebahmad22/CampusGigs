"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("campusgigs_token");
    localStorage.removeItem("campusgigs_user");
    localStorage.removeItem("campusgigs_role");
    router.replace("/signin");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-sm border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-foreground hover:border-rule-strong transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  );
}
