"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploadProps {
  currentUrl: string | null;
  userName: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  size?: "md" | "lg" | "xl";
}

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

  const sizeClasses = {
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

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

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const supabase = createClient();
        const userId =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("campusgigs_user") || "{}").id || "demo"
            : "demo";
        const ext = file.name.split(".").pop();
        const fileName = `avatars/${userId}/${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage
          .from("assets")
          .upload(fileName, file, { upsert: true });

        if (error) {
          console.error("Upload error:", error);
          // Fallback: use the preview URL as the avatar for demo
          onUpload(preview || "");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("assets").getPublicUrl(data.path);

        onUpload(publicUrl);
      } catch {
        // In demo mode, just use the local preview
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
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "relative rounded-full border-2 border-dashed transition-all duration-300 group cursor-pointer",
          sizeClasses[size],
          dragOver
            ? "border-primary scale-105 shadow-lg shadow-primary/20"
            : "border-border hover:border-primary/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={userName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-linear-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center">
            <span
              className={cn(
                "font-bold text-foreground/80",
                size === "xl" ? "text-4xl" : size === "lg" ? "text-3xl" : "text-xl"
              )}
            >
              {initials}
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Remove button */}
        {displayUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-error/90 hover:bg-error flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
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

      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Upload className="w-3 h-3" />
        <span>Click or drag to upload</span>
      </div>
    </div>
  );
}
