import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CODES_PATH    = path.join(process.cwd(), "data", "reset_codes.json");
const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");
const PROFS_PATH    = path.join(process.cwd(), "data", "professors.json");

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();
    if (!email || !code || !newPassword)
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

    if (newPassword.length < 4)
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" }, { status: 400 });

    const raw = await fs.readFile(CODES_PATH, "utf-8");
    let codes: any[] = JSON.parse(raw);
    const entry = codes.find(c => c.email === email && c.code === code);

    if (!entry) return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 400 });
    if (entry.expiresAt < Date.now()) return NextResponse.json({ error: "انتهت صلاحية الرمز، اطلب رمزاً جديداً" }, { status: 400 });

    if (entry.role === "student") {
      const students: any[] = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
      const idx = students.findIndex(s => s.email === email);
      if (idx === -1) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      students[idx].password = newPassword;
      await fs.writeFile(STUDENTS_PATH, JSON.stringify(students, null, 2), "utf-8");
    } else if (entry.role === "professor") {
      const profs: any[] = JSON.parse(await fs.readFile(PROFS_PATH, "utf-8"));
      const idx = profs.findIndex(p => p.email === email);
      if (idx === -1) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      profs[idx].password = newPassword;
      await fs.writeFile(PROFS_PATH, JSON.stringify(profs, null, 2), "utf-8");
    }

    codes = codes.filter(c => c.email !== email);
    await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2), "utf-8");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في الخادم" }, { status: 500 });
  }
}
