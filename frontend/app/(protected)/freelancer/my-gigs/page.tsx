"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  GigWithProposal,
  GigStatus,
  ProposalStatus,
} from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const proposalBadge: Record<
  ProposalStatus,
  { label: string; variant: "primary" | "success" | "error" }
> = {
  pending: { label: "Pending", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Not selected", variant: "error" },
};

const gigBadge: Record<
  GigStatus,
  {
    label: string;
    variant: "primary" | "secondary" | "warning" | "success" | "error";
  }
> = {
  open: { label: "Open", variant: "primary" },
  in_progress: { label: "In progress", variant: "secondary" },
  pending_completion: { label: "Submitted", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

interface ColumnProps {
  title: string;
  kicker: string;
  items: GigWithProposal[];
  emptyText: string;
  emptyAction?: React.ReactNode;
  renderRight?: (item: GigWithProposal) => React.ReactNode;
  showProposalBadge?: boolean;
  router: ReturnType<typeof useRouter>;
}

function Column({
  title,
  kicker,
  items,
  emptyText,
  emptyAction,
  renderRight,
  showProposalBadge,
  router,
}: ColumnProps) {
  return (
    <div>
      <div className="pb-3 border-b border-rule flex items-baseline justify-between">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-subtle mb-1">
            {kicker}
          </span>
          <h3 className="font-serif text-xl text-foreground">{title}</h3>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle tabular-nums">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-rule bg-surface-elevated/40 p-6 text-center">
          <p className="font-serif text-base text-foreground">{emptyText}</p>
          {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const gb = gigBadge[item.status];
            const pb = proposalBadge[item.proposal.status];
            return (
              <li key={item.proposal.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/freelancer/gigs/${item.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/freelancer/gigs/${item.id}`);
                    }
                  }}
                  className="group w-full text-left rounded-md border border-border bg-surface p-4 hover:bg-surface-elevated hover:border-rule-strong transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-serif text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    {showProposalBadge ? (
                      <Badge variant={pb.variant} size="sm">
                        {pb.label}
                      </Badge>
                    ) : (
                      <Badge variant={gb.variant} size="sm">
                        {gb.label}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle truncate">
                      {item.clientName}
                    </span>
                    <span className="font-mono tabular-nums text-[12px] text-accent">
                      {item.tokenReward} tok
                    </span>
                  </div>
                  <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                    {new Date(
                      item.proposal.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {renderRight ? (
                    <div
                      className="mt-3 pt-3 border-t border-rule"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderRight(item)}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function MyGigsPage() {
  const router = useRouter();
  const [items, setItems] = useState<GigWithProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("campusgigs_token")
      : null;

  const loadData = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/gigs/my-proposals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.data)) setItems(data.data);
        else setError(data?.error || "Failed to load.");
      })
      .catch(() => setError("Unable to connect to backend."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) {
      router.replace("/signin");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  const appliedGigs = items.filter(
    (g) => g.proposal.status === "pending" || g.proposal.status === "rejected"
  );
  const activeGigs = items.filter(
    (g) =>
      g.proposal.status === "accepted" &&
      ["in_progress", "pending_completion"].includes(g.status)
  );
  const completedGigs = items.filter((g) => g.status === "closed");

  const handleMarkComplete = async (gigId: string) => {
    setActionLoading(gigId);
    try {
      const res = await fetch(`${API}/api/gigs/${gigId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed.");
        return;
      }
      loadData();
    } catch {
      setError("Request failed.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        <SectionHeading
          title="My gigs"
          kicker="Freelancer · Track work"
        />

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        {loading ? (
          <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
            Loading…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No gigs yet."
              description="Apply to your first gig to start tracking work."
              action={
                <Button
                  onClick={() => router.push("/freelancer/gigs")}
                  variant="accent"
                >
                  Browse gigs
                </Button>
              }
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            <Column
              title="Applied"
              kicker="Column I"
              items={appliedGigs}
              emptyText="No pending proposals."
              showProposalBadge
              router={router}
            />
            <Column
              title="Active"
              kicker="Column II"
              items={activeGigs}
              emptyText="No active gigs."
              emptyAction={
                <Button
                  variant="outline"
                  onClick={() => router.push("/freelancer/gigs")}
                >
                  Browse gigs
                </Button>
              }
              router={router}
              renderRight={(item) =>
                item.status === "in_progress" ? (
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => handleMarkComplete(item.id)}
                    loading={actionLoading === item.id}
                    className="w-full"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark complete
                  </Button>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
                    Awaiting client
                  </span>
                )
              }
            />
            <Column
              title="Completed"
              kicker="Column III"
              items={completedGigs}
              emptyText="No completed gigs yet."
              router={router}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}
