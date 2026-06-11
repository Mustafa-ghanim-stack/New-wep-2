import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { sendEmail } from "@/lib/email";

const CODES_PATH    = path.join(process.cwd(), "data", "reset_codes.json");
const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");
const PROFS_PATH    = path.join(process.cwd(), "data", "professors.json");

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });

    // Auto-detect role
    let userName = "";
    let role = "";
    const students: any[] = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
    const student = students.find(s => s.email === email);
    if (student) { role = "student"; userName = student.fullName || ""; }

    if (!role) {
      const profs: any[] = JSON.parse(await fs.readFile(PROFS_PATH, "utf-8"));
      const prof = profs.find(p => p.email === email);
      if (prof) { role = "professor"; userName = prof.fullName || prof.name || ""; }
    }

    if (!role) return NextResponse.json({ error: "البريد الإلكتروني غير مسجل" }, { status: 404 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const raw = await fs.readFile(CODES_PATH, "utf-8");
    let codes: any[] = JSON.parse(raw);
    codes = codes.filter(c => c.email !== email);
    codes.push({ email, code, role, expiresAt, createdAt: Date.now() });
    await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2), "utf-8");

    await sendEmail(
      email,
      "رمز إعادة تعيين كلمة المرور - كلية الشرق",
      `
      <div dir="rtl" style="font-family:Arial;max-width:500px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
        <div style="background:#0a7d8a;color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h2 style="margin:0;">كلية الشرق</h2>
          <p style="margin:4px 0 0;opacity:0.8;">Alsharq College</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <h3 style="margin:0 0 12px;color:#1f2937;">إعادة تعيين كلمة المرور</h3>
          <p style="color:#4b5563;margin:0 0 16px;">مرحباً ${userName}،<br>رمز إعادة تعيين كلمة المرور الخاص بك هو:</p>
          <div style="background:#f0fdf4;padding:16px;border-radius:8px;text-align:center;font-size:36px;font-weight:bold;letter-spacing:10px;color:#0a7d8a;direction:ltr;">
            ${code}
          </div>
          <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">الرمز صالح لمدة 10 دقائق فقط.</p>
          <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
        </div>
      </div>
      `
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في الخادم" }, { status: 500 });
  }
}
