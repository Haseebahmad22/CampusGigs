"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Bell } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; gigId: string | null; isRead: boolean; createdAt: string }[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("campusgigs_role"));
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "User");
    } catch {
      setUserName("User");
    }
  }, []);

  // Fetch notification count and balance
  useEffect(() => {
    const token = localStorage.getItem("campusgigs_token");
    if (!token) return;

    const fetchData = () => {
      fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data?.unreadCount === "number") setUnreadCount(data.unreadCount);
          if (Array.isArray(data?.data)) setNotifications(data.data.slice(0, 10));
        })
        .catch(() => { });

      fetch(`${API}/api/tokens/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data?.balance === "number") setBalance(data.balance);
        })
        .catch(() => { });
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
    }).then(() => {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }).catch(() => { });
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
      { label: "Browse Gigs", href: "/freelancer/gigs" },
      { label: "My Gigs", href: "/freelancer/my-gigs" },
    ]
    : [
      { label: "Dashboard", href: "/client" },
      { label: "My Gigs", href: "/client/gigs" },
      { label: "Find Talent", href: "/client/freelancers" },
    ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
      <nav
        className="h-14 rounded-2xl flex items-center justify-between px-5 sm:px-6 gap-4"
        style={{
          background: "rgba(38,48,68,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 28px rgba(7,10,18,0.26)",
        }}
      >
        {/* Logo */}
        <Link
          href={base}
          className="text-[17px] text-foreground shrink-0 italic"
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
                className={`text-[13px] transition-colors ${isActive
                    ? "text-foreground font-medium"
                    : "text-muted hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Balance */}
          {balance !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary" title="Token Balance">
              <span className="text-[13px] font-bold">{balance}</span>
              <span className="text-[10px] uppercase font-semibold">Tokens</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <Bell className="w-4 h-4 text-muted" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl z-50">
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-muted">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-surface-elevated transition-colors ${!n.isRead ? "bg-primary/3" : ""}`}
                        onClick={() => {
                          setShowNotifs(false);
                          if (n.gigId) {
                            const gigPath = isFreelancer ? `/freelancer/gigs/${n.gigId}` : `/client/gigs/${n.gigId}`;
                            router.push(gigPath);
                          }
                        }}
                      >
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
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
