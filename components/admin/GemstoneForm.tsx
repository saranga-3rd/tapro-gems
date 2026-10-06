"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveGemstoneAction, type FormState } from "@/lib/admin/actions";
import type { GemstoneSummary } from "@/types/gemstone";
import ImagePathField, { IMAGE_PATH_HELP } from "./ImagePathField";
import MediaUploader from "./MediaUploader";
import { inputClasses, labelClasses, primaryButton, secondaryButton } from "./ui";

const CATEGORIES = ["Sapphire", "Ruby", "Star Sapphire", "Rare Gemstone"];
const VIDEOS = "video/mp4,video/webm,video/quicktime";

const initialState: FormState = {};

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className={labelClasses}>{label}</span>
      {children}
    </label>
  );
}

export default function GemstoneForm({ gemstone }: { gemstone?: GemstoneSummary }) {
  const [state, formAction, pending] = useActionState(saveGemstoneAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {gemstone ? <input type="hidden" name="id" value={gemstone.id} /> : null}

      <section className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <h2 className="font-display text-lg text-ink sm:col-span-2">Details</h2>
        <Field label="Gemstone name">
          <input name="name" required defaultValue={gemstone?.name} className={inputClasses} />
        </Field>
        <Field label="URL slug (optional)">
          <input
            name="slug"
            defaultValue={gemstone?.slug}
            placeholder="generated from the name"
            className={inputClasses}
          />
        </Field>
        <Field label="Category">
          <select
            name="category"
            defaultValue={gemstone?.category ?? "Sapphire"}
            className={inputClasses}
          >
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="Carat weight (ct)">
          <input
            name="caratWeight"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={gemstone?.caratWeight}
            className={inputClasses}
          />
        </Field>
        <Field label="Cut">
          <input name="cut" defaultValue={gemstone?.cut} className={inputClasses} />
        </Field>
        <Field label="Colour">
          <input name="colour" defaultValue={gemstone?.colour} className={inputClasses} />
        </Field>
        <Field label="Origin">
          <input name="origin" defaultValue={gemstone?.origin} className={inputClasses} />
        </Field>
        <Field label="Certification">
          <input
            name="certification"
            defaultValue={gemstone?.certification}
            className={inputClasses}
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            name="description"
            rows={5}
            defaultValue={gemstone?.description}
            className={inputClasses}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={gemstone?.featured}
            className="h-4 w-4 accent-gold-500"
          />
          Show in the homepage &ldquo;Featured Gemstones&rdquo; grid
        </label>
      </section>

      <section className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg text-ink">Media</h2>
        <p className="rounded-lg bg-ivory-100 p-3 text-sm text-ink-muted">{IMAGE_PATH_HELP}</p>
        <ImagePathField
          name="image"
          label="Main image path"
          required
          hideHelp
          initial={gemstone ? [gemstone.image] : []}
        />
        <ImagePathField
          name="gallery"
          label="Gallery image paths (in display order)"
          multiple
          hideHelp
          initial={gemstone?.gallery}
        />
        <MediaUploader
          name="video"
          label="Video (optional)"
          accept={VIDEOS}
          initial={gemstone?.video ? [gemstone.video] : []}
        />
      </section>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving..." : gemstone ? "Save changes" : "Create gemstone"}
        </button>
        <Link href="/admin/shop" className={secondaryButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
