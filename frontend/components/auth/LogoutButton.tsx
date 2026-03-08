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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-elevated text-sm font-medium text-muted hover:text-foreground transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
