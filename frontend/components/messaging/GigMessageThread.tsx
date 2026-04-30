"use client";

import * as React from "react";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toaster";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const POLL_MS = 5000;

interface Message {
  id: string;
  gigId: string;
  senderId: string;
  senderName: string | null;
  senderAvatar: string | null;
  body: string;
  createdAt: string;
}

interface GigMessageThreadProps {
  gigId: string;
  currentUserId: string;
  className?: string;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export function GigMessageThread({
  gigId,
  currentUserId,
  className,
}: GigMessageThreadProps) {
  const toast = useToast();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchMessages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("campusgigs_token");
      const response = await fetch(`${API}/api/gigs/${gigId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const json = await response.json();
      setMessages(json.data || []);
    } catch {
      /* silent poll */
    } finally {
      setLoading(false);
    }
  }, [gigId]);

  React.useEffect(() => {
    fetchMessages();
    const id = window.setInterval(fetchMessages, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchMessages]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem("campusgigs_token");
      const response = await fetch(`${API}/api/gigs/${gigId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body }),
      });
      const json = await response.json();
      if (!response.ok) {
        toast.error("Could not send message", json.error || "Please try again.");
        return;
      }
      setMessages((prev) => [...prev, json]);
      setDraft("");
    } catch (err) {
      toast.error(
        "Could not send message",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-[480px] flex-col overflow-hidden rounded-md border border-border bg-surface",
        className
      )}
    >
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {loading ? (
          <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle className="mb-3 size-6 text-primary" />
            <p className="font-serif text-base text-foreground">
              No messages yet.
            </p>
            <p className="mt-1 text-sm text-muted">
              Say hi to kick things off.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-end gap-2",
                  mine && "flex-row-reverse"
                )}
              >
                <Avatar
                  src={m.senderAvatar}
                  fallback={m.senderName ?? "·"}
                  size="sm"
                />
                <div
                  className={cn(
                    "max-w-[75%] rounded-md px-3.5 py-2 text-[14px]",
                    mine
                      ? "bg-primary text-[#F7F4EC]"
                      : "border border-rule bg-surface-elevated text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
                      mine ? "text-[#F7F4EC]/70" : "text-subtle"
                    )}
                  >
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-rule bg-surface-elevated/60 px-3 py-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          maxLength={4000}
          className="flex-1 bg-transparent px-3 py-2 text-[14px] text-foreground placeholder:text-subtle focus:outline-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim() || sending}
          aria-label="Send"
          variant="accent"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
