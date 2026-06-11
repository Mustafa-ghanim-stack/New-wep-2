import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PROFESSORS_PATH = path.join(process.cwd(), "data", "professors.json");
const AVATARS_DIR     = path.join(process.cwd(), "public", "avatars");

function verifyToken(token: string) {
  try {
    const d = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (d.exp < Date.now()) return null;
    return d;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professors = JSON.parse(await fs.readFile(PROFESSORS_PATH, "utf-8"));
    const prof = professors.find((p: any) => p.id === payload.id || p.email === payload.email);
    if (!prof) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ avatar: prof.avatar || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professors = JSON.parse(await fs.readFile(PROFESSORS_PATH, "utf-8"));
    const idx = professors.findIndex((p: any) => p.id === payload.id || p.email === payload.email);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const filename = `prof_${professors[idx].id}.${ext}`;
    const filepath = path.join(AVATARS_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.mkdir(AVATARS_DIR, { recursive: true });
    await fs.writeFile(filepath, buffer);

    for (const oldExt of ["jpg", "jpeg", "png", "webp", "gif"]) {
      if (oldExt !== ext) {
        await fs.unlink(path.join(AVATARS_DIR, `prof_${professors[idx].id}.${oldExt}`)).catch(() => {});
      }
    }

    const avatarUrl = `/avatars/${filename}`;
    professors[idx].avatar = avatarUrl;
    await fs.writeFile(PROFESSORS_PATH, JSON.stringify(professors, null, 2));

    return NextResponse.json({ ok: true, avatar: avatarUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professors = JSON.parse(await fs.readFile(PROFESSORS_PATH, "utf-8"));
    const idx = professors.findIndex((p: any) => p.id === payload.id || p.email === payload.email);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
      await fs.unlink(path.join(AVATARS_DIR, `prof_${professors[idx].id}.${ext}`)).catch(() => {});
    }
    professors[idx].avatar = null;
    await fs.writeFile(PROFESSORS_PATH, JSON.stringify(professors, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
