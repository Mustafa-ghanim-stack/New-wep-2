import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");
const AVATARS_DIR   = path.join(process.cwd(), "public", "avatars");

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

    const students = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
    const student  = students.find((s: any) => s.id === payload.id || s.email === payload.email);
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ avatar: student.avatar || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const students = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
    const idx = students.findIndex((s: any) => s.id === payload.id || s.email === payload.email);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const filename = `${students[idx].id}.${ext}`;
    const filepath = path.join(AVATARS_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.mkdir(AVATARS_DIR, { recursive: true });
    await fs.writeFile(filepath, buffer);

    // Remove old avatar with different extension
    for (const oldExt of ["jpg", "jpeg", "png", "webp", "gif"]) {
      if (oldExt !== ext) {
        const old = path.join(AVATARS_DIR, `${students[idx].id}.${oldExt}`);
        await fs.unlink(old).catch(() => {});
      }
    }

    const avatarUrl = `/avatars/${filename}`;
    students[idx].avatar = avatarUrl;
    await fs.writeFile(STUDENTS_PATH, JSON.stringify(students, null, 2));

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

    const students = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
    const idx = students.findIndex((s: any) => s.id === payload.id || s.email === payload.email);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
      await fs.unlink(path.join(AVATARS_DIR, `${students[idx].id}.${ext}`)).catch(() => {});
    }
    students[idx].avatar = null;
    await fs.writeFile(STUDENTS_PATH, JSON.stringify(students, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
