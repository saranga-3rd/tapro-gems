/**
 * Image references are repository paths such as "/images/gems/sapphire.webp". Files are added to
 * public/images by a developer and deployed; the admin only stores the path.
 */
export const IMAGE_FOLDERS = ["gems", "gallery", "site"] as const;
export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif"] as const;

const PATH_PATTERN = new RegExp(
  `^/images/(?:${IMAGE_FOLDERS.join("|")})/(?:[A-Za-z0-9._ -]+/)*[A-Za-z0-9._ -]+\.(?:${IMAGE_EXTENSIONS.join("|")})$`,
  "i",
);

/** True for a safe, project-relative image path under /images/<folder>/. */
export function isProjectImagePath(value: string): boolean {
  return PATH_PATTERN.test(value) && !value.split("/").some((part) => part === "." || part === "..");
}

/**
 * Returns an error message, or null when the value may be saved. A value identical to one already
 * stored (`existing`) is accepted so records that still point at an external or older location can
 * be edited without being forced to migrate.
 */
export function imagePathError(value: string, existing: readonly string[] = []): string | null {
  if (existing.includes(value)) return null;
  if (isProjectImagePath(value)) return null;
  return `Image paths must look like /images/gems/name.webp (folders: ${IMAGE_FOLDERS.join(", ")}; types: ${IMAGE_EXTENSIONS.join(", ")}).`;
}
