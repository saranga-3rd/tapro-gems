"use client";

import { Upload, X } from "lucide-react";
import { upload, uploadPresigned } from "@vercel/blob/client";
import { useRef, useState } from "react";
import MediaPreview from "./MediaPreview";
import { labelClasses, secondaryButton } from "./ui";

export interface UploadedFile {
  src: string;
  type: "image" | "video";
  name: string;
}

export async function uploadFiles(files: FileList | File[]): Promise<UploadedFile[]> {
  // Production (Vercel Blob): the API route answers the token handshake with JSON. Locally it
  // is a plain multipart endpoint, so probe once and fall back.
  const list = Array.from(files);
  const probe = await fetch("/api/admin/upload", { method: "GET", cache: "no-store" }).catch(() => null);
  const mode = probe?.headers.get("x-upload-mode");
  if (mode === "blob" || mode === "presigned") {
    const send = mode === "blob" ? upload : uploadPresigned;
    return Promise.all(
      list.map(async (file) => {
        const blob = await send(`uploads/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        return {
          src: blob.url,
          type: file.type.startsWith("video/") ? ("video" as const) : ("image" as const),
          name: file.name,
        };
      }),
    );
  }

  const body = new FormData();
  for (const file of Array.from(files)) body.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Upload failed.");
  return json.files;
}

interface MediaUploaderProps {
  /** Form field name; one hidden input per file is submitted under it. */
  name: string;
  label: string;
  accept: string;
  multiple?: boolean;
  initial?: string[];
  /** When set, also submits the media type ("image" | "video") of the selected file. */
  typeName?: string;
}

export default function MediaUploader({
  name,
  label,
  accept,
  multiple = false,
  initial = [],
  typeName,
}: MediaUploaderProps) {
  const [items, setItems] = useState<{ src: string; type?: "image" | "video" }[]>(
    initial.map((src) => ({ src })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFiles(files);
      setItems((current) => (multiple ? [...current, ...uploaded] : [uploaded[0]]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className={labelClasses}>{label}</span>

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.src}
              className="relative overflow-hidden rounded-lg border border-navy-900/10 bg-ivory-100"
            >
              <MediaPreview
                src={item.src}
                type={item.type}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-navy-950/80 text-white hover:bg-navy-950"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <input type="hidden" name={name} value={item.src} />
              {typeName ? <input type="hidden" name={typeName} value={item.type ?? ""} /> : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-3">
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => onPick(e.target.files)}
        />
        <button
          type="button"
          className={secondaryButton}
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {busy ? "Uploading..." : items.length && !multiple ? "Replace file" : "Upload"}
        </button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}
