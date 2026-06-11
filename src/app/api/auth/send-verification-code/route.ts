import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { sendEmail } from "@/lib/email";

const CODES_PATH = path.join(process.cwd(), "data", "verification_codes.json");
const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, phone } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const raw = await fs.readFile(CODES_PATH, "utf-8");
    const codes = JSON.parse(raw);

    codes.push({ email, code, expiresAt, fullName, phone, createdAt: Date.now() });
    await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2), "utf-8");

    try {
      await sendEmail(
        email,
        "رمز التحقق - كلية الشرق / Verification Code - Alsharq College",
        `
        <div dir="rtl" style="font-family:Arial;max-width:500px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
          <div style="background:#1a3a3a;color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
            <h2 style="margin:0;">كلية الشرق</h2>
            <p style="margin:4px 0 0;opacity:0.8;">Alsharq College</p>
          </div>
          <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
            <h3 style="margin:0 0 12px;color:#1f2937;">رمز التحقق / Verification Code</h3>
            <p style="color:#4b5563;margin:0 0 16px;">مرحباً ${fullName}،<br>رمز التحقق الخاص بك هو:</p>
            <div style="background:#f3f4f6;padding:16px;border-radius:8px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#059669;direction:ltr;">
              ${code}
            </div>
            <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">الرمز صالح لمدة 10 دقائق. / Code expires in 10 minutes.</p>
          </div>
        </div>
        `
      );
    } catch (emailErr: any) {
      const idx = codes.findIndex((c: any) => c.email === email && c.code === code);
      if (idx !== -1) codes.splice(idx, 1);
      await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2), "utf-8");
      console.error("SMTP Error:", emailErr?.message, emailErr?.code);
      return NextResponse.json({ error: "Failed to send email: " + (emailErr?.message || "Check SMTP settings") }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Verification code sent to your email!" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
