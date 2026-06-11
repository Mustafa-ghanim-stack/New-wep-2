import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STUDENTS_PATH  = path.join(process.cwd(), "data", "students.json");
const PROFS_PATH     = path.join(process.cwd(), "data", "professors.json");

function makeToken(payload: object) {
  return Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })
  ).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });

    // ── Check students ──────────────────────────────────────────────
    const students: any[] = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
    const student = students.find(s => s.email === email);
    if (student) {
      if (student.password !== password)
        return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
      const token = makeToken({ id: student.id, email: student.email });
      return NextResponse.json({
        role: "student",
        token,
        data: {
          id: student.id, fullName: student.fullName, email: student.email,
          phone: student.phone || "", department: student.department || "",
          branch: student.branch || "", status: student.status, createdAt: student.createdAt,
        },
      });
    }

    // ── Check professors ────────────────────────────────────────────
    const profs: any[] = JSON.parse(await fs.readFile(PROFS_PATH, "utf-8"));
    const prof = profs.find(p => p.email === email);
    if (prof) {
      if (prof.status === "pending")
        return NextResponse.json({ error: "حسابك قيد المراجعة، انتظر موافقة الإدارة" }, { status: 403 });
      if (prof.password !== password)
        return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
      const token = makeToken({ id: prof.id, email: prof.email, role: "professor" });
      return NextResponse.json({
        role: "professor",
        token,
        data: {
          id: prof.id, fullName: prof.fullName || prof.name || "", email: prof.email,
          phone: prof.phone || "", specialization: prof.specialization || prof.department || "",
          department: prof.department || prof.specialization || "",
          position: prof.position || "", status: prof.status, createdAt: prof.createdAt,
        },
      });
    }

    return NextResponse.json({ error: "البريد الإلكتروني غير مسجل" }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في الخادم" }, { status: 500 });
  }
}
