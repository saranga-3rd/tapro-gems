"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { imagePathError } from "@/lib/image-path";
import { inputClasses, labelClasses, secondaryButton } from "./ui";

export const IMAGE_PATH_HELP =
  "Images are not uploaded here. Add the file to the project's public/images folder (gems, gallery or site), commit, push and deploy first, then enter its path, e.g. /images/gems/sapphire.webp.";

/** Preview of a project image path; reports a missing file instead of showing a broken image. */
export function ImagePathPreview({ src, size = 160 }: { src: string; size?: number }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src) return null;
  if (failed === src) {
    return (
      <p className="text-xs text-red-600">
        No image found at this path. Check the filename, and that the file has been deployed.
      </p>
    );
  }
  return (
    <Image
      key={src}
      src={src}
      alt="Preview"
      width={size}
      height={size}
      quality={90}
      onError={() => setFailed(src)}
      className="rounded-lg border border-navy-900/10 bg-ivory-100 object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function PathInput({
  name,
  value,
  onChange,
  existing,
  required,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  existing: readonly string[];
  required?: boolean;
}) {
  const trimmed = value.trim();
  const error = trimmed ? imagePathError(trimmed, existing) : null;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <input
        name={name}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/gems/sapphire.webp"
        spellCheck={false}
        className={inputClasses}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : <ImagePathPreview src={trimmed} />}
    </div>
  );
}

interface ImagePathFieldProps {
  /** Form field name; one input per path is submitted under it, in order. */
  name: string;
  label: string;
  multiple?: boolean;
  required?: boolean;
  initial?: string[];
  hideHelp?: boolean;
}

export default function ImagePathField({
  name,
  label,
  multiple = false,
  required = false,
  initial = [],
  hideHelp = false,
}: ImagePathFieldProps) {
  const [paths, setPaths] = useState<string[]>(initial.length || multiple ? initial : [""]);
  const set = (index: number, value: string) =>
    setPaths((current) => current.map((p, i) => (i === index ? value : p)));
  const move = (index: number, by: number) =>
    setPaths((current) => {
      const next = [...current];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <span className={labelClasses}>{label}</span>
      {hideHelp ? null : <p className="text-xs text-ink-muted">{IMAGE_PATH_HELP}</p>}
      <ul className="flex flex-col gap-3">
        {paths.map((path, index) => (
          <li key={index} className="flex items-start gap-2">
            <PathInput
              name={name}
              value={path}
              onChange={(value) => set(index, value)}
              existing={initial}
              required={required && !multiple}
            />
            {multiple ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-lg border border-navy-900/15 p-2 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === paths.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-lg border border-navy-900/15 p-2 disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setPaths((current) => current.filter((_, i) => i !== index))}
                  className="rounded-lg border border-navy-900/15 p-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {multiple ? (
        <div>
          <button type="button" className={secondaryButton} onClick={() => setPaths([...paths, ""])}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add image path
          </button>
        </div>
      ) : null}
    </div>
  );
}
