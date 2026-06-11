import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PROFS_PATH = path.join(process.cwd(), "data", "professors.json");

function verifyToken(token: string) {
  try {
    const d = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (d.exp < Date.now()) return null;
    return d;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const { token, currentPassword, newPassword } = await request.json();
    if (!token || !currentPassword || !newPassword)
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (newPassword.length < 4)
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" }, { status: 400 });

    const profs: any[] = JSON.parse(await fs.readFile(PROFS_PATH, "utf-8"));
    const idx = profs.findIndex((p: any) => p.id === payload.id || p.email === payload.email);
    if (idx === -1) return NextResponse.json({ error: "الأستاذ غير موجود" }, { status: 404 });

    if (profs[idx].password !== currentPassword)
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });

    profs[idx].password = newPassword;
    await fs.writeFile(PROFS_PATH, JSON.stringify(profs, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
