"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Camera, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface AvatarUploadProps {
  currentUrl: string | null;
  userName: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  size?: "md" | "lg" | "xl";
}

const SIZE_PX: Record<"md" | "lg" | "xl", number> = {
  md: 80,
  lg: 112,
  xl: 144,
};

export function AvatarUpload({
  currentUrl,
  userName,
  onUpload,
  onRemove,
  size = "lg",
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const px = SIZE_PX[size];
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("campusgigs_token")
            : null;
        const userId =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("campusgigs_user") || "{}").id || "demo"
            : "demo";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("prefix", `avatars/${userId}`);

        const res = await fetch(`${API}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          console.error("Avatar upload error:", json.error);
          if (preview) onUpload(preview);
          return;
        }

        onUpload(json.publicUrl);
      } catch (err) {
        console.error("Avatar upload error:", err);
        if (preview) onUpload(preview);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, preview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const displayUrl = preview || currentUrl;

  return (
    <div className="flex flex-col items-start gap-3">
      <div
        className={cn(
          "relative rounded-sm border-2 border-dashed transition-colors duration-150 group cursor-pointer overflow-hidden",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-rule hover:border-rule-strong"
        )}
        style={{ width: px, height: px }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={userName}
            width={px}
            height={px}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
            <span
              className={cn(
                "font-serif text-foreground/80",
                size === "xl"
                  ? "text-4xl"
                  : size === "lg"
                    ? "text-3xl"
                    : "text-xl"
              )}
            >
              {initials}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-foreground/35 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-[#F7F4EC]/30 border-t-[#F7F4EC] rounded-full animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-[#F7F4EC]" />
          )}
        </div>

        {displayUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-sm bg-error text-[#F7F4EC] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove photo"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle inline-flex items-center gap-1.5">
        <Upload className="w-3 h-3" />
        Click or drag · JPG/PNG/WEBP · 5 MB
      </span>
    </div>
  );
}
