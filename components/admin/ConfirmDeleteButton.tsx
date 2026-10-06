"use client";

import { Trash2 } from "lucide-react";
import { useRef, useTransition } from "react";
import { dangerButton, secondaryButton } from "./ui";

interface ConfirmDeleteButtonProps {
  action: (form: FormData) => Promise<void>;
  fields: Record<string, string>;
  /** What is being deleted, used in the confirmation message. */
  itemName: string;
  label?: string;
  className?: string;
}

/** Permanent deletions always pass through this confirmation dialog. */
export default function ConfirmDeleteButton({
  action,
  fields,
  itemName,
  label = "Delete",
  className = "",
}: ConfirmDeleteButtonProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    startTransition(async () => {
      await action(data);
      dialog.current?.close();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 transition-colors hover:bg-red-50 ${className}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

      <dialog
        ref={dialog}
        className="m-auto w-[min(92vw,26rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-navy-950/60"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-xl text-ink">Are you sure you want to delete this?</h2>
          <p className="text-sm text-ink-muted">
            <strong className="text-ink">{itemName}</strong> will be permanently removed. This
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={secondaryButton}
              onClick={() => dialog.current?.close()}
              disabled={pending}
              autoFocus
            >
              Cancel
            </button>
            <button type="button" className={dangerButton} onClick={confirm} disabled={pending}>
              {pending ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
