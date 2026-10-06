"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { addMediaAction } from "@/lib/admin/actions";
import { uploadFiles } from "./MediaUploader";
import { primaryButton } from "./ui";

interface MediaAdderProps {
  list: "collections" | "gallery";
  label: string;
}

const VIDEOS = "video/mp4,video/webm,video/quicktime";

/** Uploads one or more videos and adds each as a new item. Images are added by path instead. */
export default function MediaAdder({ list, label }: MediaAdderProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFiles(files);
      for (const file of uploaded) {
        const result = await addMediaAction(list, file.src, "video", file.name.replace(/\.[^.]+$/, ""));
        if (result.error) throw new Error(result.error);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={VIDEOS}
        onChange={(e) => onPick(e.target.files)}
      />
      <button
        type="button"
        className={primaryButton}
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        {busy ? "Uploading..." : label}
      </button>
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </div>
  );
}
