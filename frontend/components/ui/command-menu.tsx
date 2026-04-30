"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  PlusSquare,
  Users,
  MessageSquare,
  Briefcase,
  Compass,
  UserPen,
  LayoutDashboard,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "freelancer";

type Action = {
  id: string;
  label: string;
  description?: string;
  route: string;
  icon: LucideIcon;
  kbd?: string;
  group: string;
};

const CLIENT_ACTIONS: Action[] = [
  {
    id: "post-gig",
    label: "Post a gig",
    description: "Create a new gig listing",
    route: "/client/gigs/new",
    icon: PlusSquare,
    kbd: "G N",
    group: "Quick actions",
  },
  {
    id: "find-freelancer",
    label: "Find a freelancer",
    description: "Browse student talent",
    route: "/client/freelancers",
    icon: Users,
    kbd: "F",
    group: "Quick actions",
  },
  {
    id: "open-chat",
    label: "Open a chat",
    description: "Jump to your active gigs",
    route: "/client/gigs",
    icon: MessageSquare,
    kbd: "C",
    group: "Quick actions",
  },
];

const FREELANCER_ACTIONS: Action[] = [
  {
    id: "browse-gigs",
    label: "Browse gigs",
    description: "Find new work",
    route: "/freelancer/gigs",
    icon: Compass,
    kbd: "B",
    group: "Quick actions",
  },
  {
    id: "my-gigs",
    label: "My gigs",
    description: "Track applied and active gigs",
    route: "/freelancer/my-gigs",
    icon: Briefcase,
    kbd: "M",
    group: "Quick actions",
  },
  {
    id: "edit-profile",
    label: "Edit profile",
    description: "Update skills and bio",
    route: "/freelancer/profile/edit",
    icon: UserPen,
    kbd: "E",
    group: "Quick actions",
  },
];

const SHARED_NAV = (role: Role): Action[] => [
  {
    id: "dashboard",
    label: "Dashboard",
    route: role === "client" ? "/client" : "/freelancer",
    icon: LayoutDashboard,
    group: "Navigate",
  },
  {
    id: "notifications",
    label: "Notifications",
    route: "/notifications",
    icon: Bell,
    group: "Navigate",
  },
  {
    id: "pricing",
    label: "Pricing",
    route: "/pricing",
    icon: CreditCard,
    group: "Navigate",
  },
  {
    id: "how",
    label: "How it works",
    route: "/how-it-works",
    icon: HelpCircle,
    group: "Navigate",
  },
  {
    id: "signout",
    label: "Sign out",
    route: "/signin?signout=1",
    icon: LogOut,
    group: "Navigate",
  },
];

interface CommandMenuProps {
  role?: Role;
}

export function CommandMenu({ role: roleProp }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const role: Role = roleProp ?? (pathname?.startsWith("/client") ? "client" : "freelancer");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlight(0);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const allActions = React.useMemo(() => {
    const signature = role === "client" ? CLIENT_ACTIONS : FREELANCER_ACTIONS;
    return [...signature, ...SHARED_NAV(role)];
  }, [role]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.id.includes(q)
    );
  }, [query, allActions]);

  React.useEffect(() => {
    setHighlight(0);
  }, [query]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, Action[]>();
    for (const a of filtered) {
      if (!map.has(a.group)) map.set(a.group, []);
      map.get(a.group)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const flat = React.useMemo(() => filtered, [filtered]);

  const handleSelect = React.useCallback(
    (action: Action) => {
      setOpen(false);
      router.push(action.route);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(flat.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const action = flat[highlight];
      if (action) handleSelect(action);
    }
  };

  if (!open) return null;

  let visibleIndex = -1;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-24">
      <div
        className="absolute inset-0 bg-foreground/30"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl rounded-md border border-rule-strong bg-surface shadow-[0_4px_0_0_rgba(196,187,161,0.5)] overflow-hidden">
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
          <Search className="size-4 text-subtle shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search actions, navigate…"
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none"
          />
          <kbd className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle border border-rule rounded-sm px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {grouped.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No matches.
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                  {group}
                </div>
                <ul>
                  {items.map((action) => {
                    visibleIndex += 1;
                    const isActive = visibleIndex === highlight;
                    const Icon = action.icon;
                    return (
                      <li key={action.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlight(flat.indexOf(action))}
                          onClick={() => handleSelect(action)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isActive
                              ? "bg-surface-elevated"
                              : "hover:bg-surface-elevated/60"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              isActive ? "text-primary" : "text-muted"
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm text-foreground">
                              {action.label}
                            </span>
                            {action.description ? (
                              <span className="block text-xs text-muted truncate">
                                {action.description}
                              </span>
                            ) : null}
                          </span>
                          {action.kbd ? (
                            <kbd className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle border border-rule rounded-sm px-1.5 py-0.5">
                              {action.kbd}
                            </kbd>
                          ) : null}
                          {isActive ? (
                            <CornerDownLeft className="size-3.5 text-primary" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
