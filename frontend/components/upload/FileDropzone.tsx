"use client";

import * as React from "react";
import {
  FileText,
  Image as ImageIcon,
  FileArchive,
  Upload,
  X,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

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

export interface Attachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  kind: "spec" | "submission";
  uploaderId?: string;
  createdAt?: string;
}

interface FileDropzoneProps {
  gigId: string;
  kind: "spec" | "submission";
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
  canEdit: boolean;
  emptyHint?: string;
  className?: string;
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

export function FileDropzone({
  gigId,
  kind,
  attachments,
  onChange,
  canEdit,
  emptyHint,
  className,
}: FileDropzoneProps) {
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState<string[]>([]);

  const remaining = Math.max(MAX_FILES - attachments.length, 0);
  const atLimit = remaining === 0;

  const uploadOne = React.useCallback(
    async (file: File) => {
      if (!ALLOWED_MIME.has(file.type)) {
        toast.error(
          "File type not allowed",
          "Use PDF, PNG, JPEG, WEBP, or ZIP."
        );
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("File too large", "Maximum size is 10 MB.");
        return;
      }

      const tempKey = `${file.name}-${Date.now()}`;
      setUploading((prev) => [...prev, tempKey]);

      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "bin";
        const folder = kind === "spec" ? "gigs" : "submissions";
        const path = `${folder}/${gigId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("assets")
          .upload(path, file, { upsert: false, contentType: file.type });

        if (uploadError) {
          toast.error("Upload failed", uploadError.message);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("assets").getPublicUrl(uploadData.path);

        const token = localStorage.getItem("campusgigs_token");
        const response = await fetch(`${API}/api/gigs/${gigId}/attachments`, {
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
            kind,
          }),
        });

        const json = await response.json();
        if (!response.ok) {
          toast.error(
            "Could not save attachment",
            json.error || "Please try again."
          );
          await supabase.storage.from("assets").remove([uploadData.path]);
          return;
        }

        onChange([...attachments, json]);
        toast.success("File uploaded", file.name);
      } catch (err) {
        toast.error(
          "Upload failed",
          err instanceof Error ? err.message : "Unknown error"
        );
      } finally {
        setUploading((prev) => prev.filter((k) => k !== tempKey));
      }
    },
    [attachments, gigId, kind, onChange, toast]
  );

  const handleFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const allowed = list.slice(0, remaining);
      if (allowed.length < list.length) {
        toast.info(
          "File limit reached",
          `You can upload up to ${MAX_FILES} files.`
        );
      }
      for (const file of allowed) {
        await uploadOne(file);
      }
    },
    [remaining, toast, uploadOne]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!canEdit || atLimit) return;
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleRemove = async (attachment: Attachment) => {
    try {
      const token = localStorage.getItem("campusgigs_token");
      const response = await fetch(
        `${API}/api/gigs/${gigId}/attachments/${attachment.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        toast.error(
          "Could not remove file",
          json.error || "Please try again."
        );
        return;
      }
      onChange(attachments.filter((a) => a.id !== attachment.id));
      toast.success("File removed");
    } catch (err) {
      toast.error(
        "Could not remove file",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {canEdit ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          onClick={() => !atLimit && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !atLimit) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!atLimit) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-8 text-center transition-colors",
            atLimit
              ? "cursor-not-allowed border-rule bg-surface-elevated/40 text-subtle"
              : "cursor-pointer border-rule-strong bg-surface-elevated/40 hover:border-primary hover:bg-surface-elevated",
            dragOver && !atLimit && "border-primary bg-primary/5"
          )}
        >
          <Upload className="mb-2 size-5 text-primary" />
          <p className="font-serif text-base text-foreground">
            {atLimit
              ? `Limit reached (${MAX_FILES} files max)`
              : "Drop files here, or click to browse"}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            PDF · PNG · JPEG · WEBP · ZIP · 10 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,application/pdf,image/png,image/jpeg,image/webp,application/zip"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      ) : null}

      {uploading.length > 0 ? (
        <div className="space-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          {uploading.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-sm bg-primary" />
              Uploading…
            </div>
          ))}
        </div>
      ) : null}

      {attachments.length === 0 && !canEdit ? (
        <p className="text-sm text-muted">{emptyHint ?? "No files yet."}</p>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((a) => {
            const Icon = iconFor(a.mimeType);
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-md border border-rule bg-surface px-3 py-2.5"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-rule bg-surface-elevated text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-foreground">
                    {a.fileName}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                    {formatSize(a.fileSizeBytes)}
                  </p>
                </div>
                <a
                  href={a.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
                  aria-label={`Download ${a.fileName}`}
                >
                  <Download className="size-4" />
                </a>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(a)}
                    aria-label={`Remove ${a.fileName}`}
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
