"use client";

import { Pencil } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteMediaAction, updateMediaAction } from "@/lib/admin/actions";
import type { MediaItem } from "@/types/media";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import ImagePathField from "./ImagePathField";
import MediaPreview from "./MediaPreview";
import MediaUploader from "./MediaUploader";
import { inputClasses, labelClasses, primaryButton, secondaryButton } from "./ui";

const VIDEOS = "video/mp4,video/webm,video/quicktime";

interface MediaCardProps {
  list: "collections" | "gallery";
  item: MediaItem;
}

export default function MediaCard({ list, item }: MediaCardProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const save = (form: FormData) => {
    startTransition(async () => {
      const result = await updateMediaAction(form);
      if (result.error) return setError(result.error);
      setError("");
      dialog.current?.close();
    });
  };

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <MediaPreview
        src={item.src}
        type={item.type}
        alt={item.title}
        size={400}
        className="aspect-square w-full bg-ivory-100 object-cover"
      />
      <div className="flex flex-col gap-3 p-4">
        <p className="truncate text-sm font-medium text-ink" title={item.title}>
          {item.title}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-900/15 px-3 py-1.5 text-sm text-ink transition-colors hover:bg-ivory-100"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
          <ConfirmDeleteButton
            action={deleteMediaAction}
            fields={{ list, id: item.id }}
            itemName={item.title}
          />
        </div>
      </div>

      <dialog
        ref={dialog}
        className="m-auto max-h-[90vh] w-[min(92vw,30rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-navy-950/60"
      >
        <form action={save} className="flex flex-col gap-5 p-6">
          <h2 className="font-display text-xl text-ink">Edit item</h2>
          <input type="hidden" name="list" value={list} />
          <input type="hidden" name="id" value={item.id} />
          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Title</span>
            <input name="title" defaultValue={item.title} className={inputClasses} />
          </label>
          {item.type === "image" ? (
            <>
              <input type="hidden" name="type" value="image" />
              <ImagePathField name="src" label="Image path" required initial={[item.src]} />
            </>
          ) : (
            <MediaUploader
              name="src"
              typeName="type"
              label="Replace video (optional)"
              accept={VIDEOS}
            />
          )}
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={secondaryButton}
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button type="submit" className={primaryButton} disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </dialog>
    </li>
  );
}
