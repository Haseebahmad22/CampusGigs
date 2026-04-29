"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Coins } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function NewGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tokenReward, setTokenReward] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = title.trim() && description.trim() && Number(tokenReward) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const token = localStorage.getItem("campusgigs_token");
    if (!token) { router.replace("/signin"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/gigs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), tokenReward: Number(tokenReward) }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Failed to create gig."); return; }

      router.push("/client/gigs");
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-none mx-auto px-5 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="text-2xl font-bold text-foreground">Post a New Gig</h1>
          <p className="text-sm text-muted mt-1 mb-6">Describe the work and set a token reward</p>

          {error && <p className="text-sm text-error mb-4">{error}</p>}

          <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gig Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design a logo for my startup"
                maxLength={200}
              />
              <p className="text-xs text-muted">{title.length}/200</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you need, requirements, deliverables..."
                rows={6}
                maxLength={5000}
              />
              <p className="text-xs text-muted">{description.length}/5000</p>
            </div>

            {/* Token reward */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Token Reward</label>
              <Input
                type="number"
                value={tokenReward}
                onChange={(e) => setTokenReward(e.target.value)}
                placeholder="e.g. 50"
                min={1}
                icon={<Coins className="w-4 h-4" />}
              />
              <p className="text-xs text-muted">Amount of tokens paid on completion</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSubmit} loading={saving} disabled={!canSubmit || saving}>
                Post Gig
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
