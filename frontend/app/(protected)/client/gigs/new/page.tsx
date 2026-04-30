"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/ui/section-heading";
import { useToast } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
]);
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

interface Category {
  id: string;
  name: string;
  slug: string;
}

function iconFor(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.includes("zip")) return FileArchive;
  return FileText;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewGigPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tokenReward, setTokenReward] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/skills/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.data)) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  const canSubmit =
    title.trim() && description.trim() && Number(tokenReward) > 0;
  const remaining = Math.max(MAX_FILES - pendingFiles.length, 0);

  const queueFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const accepted: File[] = [];
    for (const file of list) {
      if (accepted.length + pendingFiles.length >= MAX_FILES) {
        toast.info("File limit reached", `Up to ${MAX_FILES} files per gig.`);
        break;
      }
      if (!ALLOWED_MIME.has(file.type)) {
        toast.error(
          "File type not allowed",
          `${file.name} — use PDF, PNG, JPEG, WEBP, or ZIP.`
        );
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error("File too large", `${file.name} exceeds 10 MB.`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) setPendingFiles((prev) => [...prev, ...accepted]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const token = localStorage.getItem("campusgigs_token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/gigs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tokenReward: Number(tokenReward),
          categoryId: categoryId || null,
        }),
      });

      const gig = await res.json();
      if (!res.ok) {
        setError(gig?.error || "Failed to create gig.");
        setSaving(false);
        return;
      }

      if (pendingFiles.length > 0) {
        const supabase = createClient();
        let uploaded = 0;
        for (const file of pendingFiles) {
          try {
            const ext = file.name.split(".").pop() || "bin";
            const path = `gigs/${gig.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

            const { data: up, error: upErr } = await supabase.storage
              .from("assets")
              .upload(path, file, { upsert: false, contentType: file.type });
            if (upErr || !up) {
              toast.error(
                "Upload failed",
                `${file.name} — ${upErr?.message || "unknown error"}`
              );
              continue;
            }
            const {
              data: { publicUrl },
            } = supabase.storage.from("assets").getPublicUrl(up.path);

            const meta = await fetch(`${API}/api/gigs/${gig.id}/attachments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                fileUrl: publicUrl,
                fileName: file.name,
                fileSizeBytes: file.size,
                mimeType: file.type,
                kind: "spec",
              }),
            });
            if (!meta.ok) {
              const err = await meta.json().catch(() => ({}));
              toast.error("Could not save attachment", err?.error || file.name);
              await supabase.storage.from("assets").remove([up.path]);
              continue;
            }
            uploaded += 1;
          } catch (err) {
            toast.error(
              "Upload failed",
              err instanceof Error ? err.message : file.name
            );
          }
        }
        if (uploaded > 0) {
          toast.success(
            "Gig posted",
            `${uploaded} file${uploaded !== 1 ? "s" : ""} attached.`
          );
        } else {
          toast.success("Gig posted");
        }
      } else {
        toast.success("Gig posted");
      }

      router.push(`/client/gigs/${gig.id}`);
    } catch {
      setError("Unable to connect to backend.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-2xl px-5 sm:px-8 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
            New gig
          </span>
          <h1 className="mt-3 font-serif text-[2.6rem] sm:text-[3.4rem] leading-[1] tracking-tight text-foreground">
            Post a <em className="italic text-primary">new gig.</em>
          </h1>
          <p className="mt-4 text-[15px] text-muted max-w-md leading-relaxed">
            Describe the work, set the reward, attach references. Freelancers
            see your gig the moment you publish.
          </p>

          {error && (
            <p className="mt-6 text-sm text-error">{error}</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="mt-12 space-y-12"
          >
            {/* Basics */}
            <section>
              <SectionHeading title="Basics" kicker="Section I" as="h3" />
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Gig title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design a logo for my startup"
                    maxLength={200}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                    {title.length} / 200
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    placeholder="No category"
                    ariaLabel="Gig category"
                    boxed={false}
                    options={[
                      { value: "", label: "No category" },
                      ...categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      })),
                    ]}
                  />
                  <p className="text-[12px] text-muted">
                    Helps freelancers find your gig.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the work, requirements, deliverables…"
                    rows={6}
                    maxLength={5000}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                    {description.length} / 5000
                  </p>
                </div>
              </div>
            </section>

            {/* Reward */}
            <section>
              <SectionHeading title="Reward" kicker="Section II" as="h3" />
              <div className="mt-6 space-y-2">
                <Label htmlFor="tokens">Token reward</Label>
                <Input
                  id="tokens"
                  type="number"
                  value={tokenReward}
                  onChange={(e) => setTokenReward(e.target.value)}
                  placeholder="50"
                  min={1}
                  icon={<Coins className="w-4 h-4" />}
                />
                <p className="text-[12px] text-muted">
                  Tokens are held in escrow and released when you confirm
                  delivery.
                </p>
              </div>
            </section>

            {/* Attachments */}
            <section>
              <SectionHeading
                title="Reference files"
                kicker="Section III · Optional"
                as="h3"
              />
              <div className="mt-6">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    remaining > 0 && fileInputRef.current?.click()
                  }
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && remaining > 0) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (remaining > 0) setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (remaining > 0 && e.dataTransfer.files.length)
                      queueFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center transition-colors",
                    remaining === 0
                      ? "cursor-not-allowed border-rule bg-surface-elevated/40 text-subtle"
                      : "cursor-pointer border-rule-strong bg-surface-elevated/40 hover:border-primary hover:bg-surface-elevated",
                    dragOver && remaining > 0 && "border-primary bg-primary/5"
                  )}
                >
                  <Upload className="mb-3 size-5 text-primary" />
                  <p className="font-serif text-base text-foreground">
                    {remaining === 0
                      ? `Limit reached (${MAX_FILES} files max)`
                      : "Drop files here, or click to browse"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                    PDF · PNG · JPEG · WEBP · ZIP · 10 MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,application/pdf,image/png,image/jpeg,image/webp,application/zip"
                    onChange={(e) => {
                      if (e.target.files) queueFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {pendingFiles.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {pendingFiles.map((file, i) => {
                      const Icon = iconFor(file.type);
                      return (
                        <li
                          key={`${file.name}-${i}`}
                          className="flex items-center gap-3 rounded-md border border-rule bg-surface px-3 py-2.5"
                        >
                          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-rule bg-surface-elevated text-primary">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] text-foreground">
                              {file.name}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                              {formatSize(file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePendingFile(i)}
                            aria-label={`Remove ${file.name}`}
                            className="inline-flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </section>

            {/* Sticky action bar */}
            <div className="sticky bottom-0 -mx-5 sm:-mx-8 px-5 sm:px-8 py-4 bg-background/95 backdrop-blur-[2px] border-t border-rule flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                {canSubmit ? "Ready" : "Draft"}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  loading={saving}
                  disabled={!canSubmit || saving}
                >
                  Post gig <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
