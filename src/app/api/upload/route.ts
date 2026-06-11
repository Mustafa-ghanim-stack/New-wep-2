import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken, extractToken } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTS = ["png", "jpg", "jpeg", "webp", "gif"];
const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // MIME type check
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: "Invalid file extension" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // File size check
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    // Sanitize custom name — only alphanumeric, dash, underscore
    const rawName = request.nextUrl.searchParams.get("name") || "";
    const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    const fileName = safeName ? `${safeName}.${ext}` : `upload-${Date.now()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(uploadDir, { recursive: true });

    // Ensure resolved path stays inside uploadDir (path traversal guard)
    const dest = path.resolve(uploadDir, fileName);
    if (!dest.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    await fs.writeFile(dest, buffer);
    return NextResponse.json({ ok: true, url: `/images/${fileName}` });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
