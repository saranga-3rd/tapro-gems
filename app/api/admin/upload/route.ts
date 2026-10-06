import fs from "node:fs/promises";
import path from "node:path";
import { issueSignedToken } from "@vercel/blob";
import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { isAdmin } from "@/lib/admin/auth";
import { UPLOAD_DIR, USE_BLOB } from "@/lib/store";

const ALLOWED: Record<string, "image" | "video"> = {
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".webp": "image",
  ".avif": "image",
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
};

// Stores created with a read-write token use client tokens; newer OIDC stores (BLOB_STORE_ID only)
// use presigned URLs.
function uploadMode() {
  if (!USE_BLOB) return "disk";
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "presigned";
}

// The mode depends on runtime env vars, so the GET probe must never be prerendered at build time.
export const dynamic = "force-dynamic";

/** Tells the uploader which mode to use. */
export async function GET() {
  return new Response(null, { headers: { "x-upload-mode": uploadMode() } });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // On Vercel the browser uploads straight to Blob (functions cap request bodies at ~4.5 MB);
  // this route only issues the upload token.
  if (uploadMode() !== "disk" && !request.headers.get("content-type")?.includes("json")) {
    return Response.json({ error: "Upload mode mismatch. Reload the page and try again." }, { status: 400 });
  }

  if (uploadMode() === "presigned") {
    const body = (await request.json()) as HandleUploadPresignedBody;
    try {
      return Response.json(
        await handleUploadPresigned({
          body,
          request,
          getSignedToken: async (pathname) => ({
            token: await issueSignedToken({
              pathname,
              operations: ["put"],
              allowedContentTypes: ["image/*", "video/*"],
            }),
            urlOptions: { addRandomSuffix: true },
          }),
        }),
      );
    } catch (error) {
      console.error("Blob presign failed", error);
      return Response.json({ error: (error as Error).message }, { status: 400 });
    }
  }

  if (uploadMode() === "blob") {
    const body = (await request.json()) as HandleUploadBody;
    try {
      return Response.json(
        await handleUpload({
          body,
          request,
          onBeforeGenerateToken: async () => ({
            allowedContentTypes: ["image/*", "video/*"],
            addRandomSuffix: true,
          }),
        }),
      );
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 400 });
    }
  }

  const form = await request.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const uploaded: { src: string; type: "image" | "video"; name: string }[] = [];

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    const type = ALLOWED[ext];
    if (!type) {
      return Response.json({ error: `Unsupported file type: ${file.name}` }, { status: 415 });
    }
    const name = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    uploaded.push({ src: `/media/${name}`, type, name: file.name });
  }

  return Response.json({ files: uploaded });
}
