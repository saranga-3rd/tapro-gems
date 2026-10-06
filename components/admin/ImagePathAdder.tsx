"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMediaAction } from "@/lib/admin/actions";
import ImagePathField, { IMAGE_PATH_HELP } from "./ImagePathField";
import { inputClasses, labelClasses, primaryButton } from "./ui";

/** Adds an image to a list by project path (the file must already be deployed in public/images). */
export default function ImagePathAdder({ list }: { list: "collections" | "gallery" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const submit = async (form: FormData) => {
    setBusy(true);
    setError("");
    const src = String(form.get("src") ?? "").trim();
    const title =
      String(form.get("title") ?? "").trim() || src.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
    const result = await addMediaAction(list, src, "image", title).catch(() => ({
      error: "Could not add the image.",
    }));
    setBusy(false);
    if (result.error) return setError(result.error);
    setVersion((v) => v + 1); // resets the fields
    router.refresh();
  };

  return (
    <form
      action={submit}
      key={version}
      className="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm"
    >
      <p className="text-xs text-ink-muted">{IMAGE_PATH_HELP}</p>
      <ImagePathField name="src" label="Image path" required hideHelp />
      <label className="flex flex-col gap-1.5">
        <span className={labelClasses}>Title (optional)</span>
        <input name="title" className={inputClasses} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className={primaryButton} disabled={busy}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {busy ? "Adding..." : "Add image"}
        </button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  );
}
