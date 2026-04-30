"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Bell } from "lucide-react";
import { CommandMenu } from "@/components/ui/command-menu";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<
    {
      id: string;
      message: string;
      gigId: string | null;
      isRead: boolean;
      createdAt: string;
    }[]
  >([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("campusgigs_role"));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("campusgigs_token");
    if (!token) return;

    const fetchData = () => {
      fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data?.unreadCount === "number")
            setUnreadCount(data.unreadCount);
          if (Array.isArray(data?.data)) setNotifications(data.data.slice(0, 10));
        })
        .catch(() => {});

      fetch(`${API}/api/tokens/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data?.balance === "number") setBalance(data.balance);
        })
        .catch(() => {});
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campusgigs_token");
    localStorage.removeItem("campusgigs_user");
    localStorage.removeItem("campusgigs_role");
    router.replace("/signin");
  };

  const markAllRead = () => {
    const token = localStorage.getItem("campusgigs_token");
    if (!token) return;
    fetch(`${API}/api/notifications/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      })
      .catch(() => {});
  };

  const handleBellClick = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs && unreadCount > 0) markAllRead();
  };

  const isFreelancer = role === "freelancer";
  const base = isFreelancer ? "/freelancer" : "/client";

  const links = isFreelancer
    ? [
        { label: "Dashboard", href: "/freelancer" },
        { label: "Browse gigs", href: "/freelancer/gigs" },
        { label: "My gigs", href: "/freelancer/my-gigs" },
      ]
    : [
        { label: "Dashboard", href: "/client" },
        { label: "My gigs", href: "/client/gigs" },
        { label: "Find talent", href: "/client/freelancers" },
      ];

  return (
    <>
      <nav className="sticky top-0 z-50 h-14 w-full border-b border-rule bg-surface/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href={base}
            className="font-serif italic text-[22px] leading-none text-foreground shrink-0"
          >
            CampusGigs
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative text-[14px] transition-colors py-4 -mb-px ${
                    isActive
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted hover:text-foreground border-b-2 border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {balance !== null && (
              <div
                className="hidden sm:flex items-center gap-1.5 border border-rule-strong rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground"
                title="Token balance"
              >
                <span className="text-subtle">TOKENS</span>
                <span className="text-foreground tabular-nums">·</span>
                <span className="tabular-nums">{balance}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true,
                });
                window.dispatchEvent(event);
              }}
              className="hidden md:inline-flex items-center gap-1.5 border border-rule rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted hover:text-foreground hover:border-rule-strong transition-colors"
              title="Open command menu (⌘K)"
            >
              <span>⌘</span>
              <span>K</span>
            </button>

            <div className="relative">
              <button
                onClick={handleBellClick}
                className="relative flex items-center justify-center w-9 h-9 rounded-sm hover:bg-surface-elevated transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-muted" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[#F7F4EC] text-[9px] font-mono tabular-nums flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifs(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-80 overflow-y-auto rounded-md border border-rule-strong bg-surface shadow-[0_2px_0_0_rgba(196,187,161,0.5)] z-50">
                    <div className="px-4 py-2.5 border-b border-rule">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                        Notifications
                      </p>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs text-muted">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-rule/60 last:border-0 cursor-pointer hover:bg-surface-elevated transition-colors ${
                            !n.isRead ? "bg-accent/[0.04]" : ""
                          }`}
                          onClick={() => {
                            setShowNotifs(false);
                            if (n.gigId) {
                              const gigPath = isFreelancer
                                ? `/freelancer/gigs/${n.gigId}`
                                : `/client/gigs/${n.gigId}`;
                              router.push(gigPath);
                            }
                          }}
                        >
                          <p className="text-[13px] text-foreground leading-relaxed">
                            {n.message}
                          </p>
                          <p className="font-mono text-[10px] text-subtle mt-1 tabular-nums">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>
      <CommandMenu role={isFreelancer ? "freelancer" : "client"} />
    </>
  );
}
