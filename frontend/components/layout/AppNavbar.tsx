"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Coins } from "lucide-react";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("campusgigs_role"));
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "User");
    } catch {
      setUserName("User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campusgigs_token");
    localStorage.removeItem("campusgigs_user");
    localStorage.removeItem("campusgigs_role");
    router.replace("/signin");
  };

  const isFreelancer = role === "freelancer";
  const base = isFreelancer ? "/freelancer" : "/client";

  const links = isFreelancer
    ? [
        { label: "Dashboard", href: "/freelancer" },
        { label: "Edit Profile", href: "/freelancer/profile/edit" },
        { label: "Browse Gigs", href: "/freelancer" },
      ]
    : [
        { label: "Dashboard", href: "/client" },
        { label: "Find Talent", href: "/client/freelancers" },
        { label: "My Gigs", href: "/client" },
      ];

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[960px]">
      <nav
        className="h-[56px] rounded-2xl flex items-center justify-between px-5 sm:px-6 gap-4"
        style={{
          background: "rgba(12,12,21,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <Link
          href={base}
          className="text-[17px] text-white shrink-0 italic"
          style={{ fontFamily: "var(--font-logo)" }}
        >
          CampusGigs
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[13px] transition-colors ${
                  isActive
                    ? "text-white/90 font-medium"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Tokens */}
          <Link
            href={`${base}/tokens`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent">180</span>
          </Link>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/80 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
