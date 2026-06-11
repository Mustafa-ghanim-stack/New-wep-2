import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WARNINGS_PATH = path.join(process.cwd(), "data", "warnings.json");
const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");

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
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    let warnings: any[] = [];
    try { warnings = JSON.parse(await fs.readFile(WARNINGS_PATH, "utf-8")); } catch {}

    const myWarnings = warnings.filter((w: any) => w.studentId === student.id)
      .sort((a: any, b: any) => b.date.localeCompare(a.date));
    return NextResponse.json({ warnings: myWarnings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { warningId } = await request.json();
    let warnings: any[] = [];
    try { warnings = JSON.parse(await fs.readFile(WARNINGS_PATH, "utf-8")); } catch {}

    warnings = warnings.map((w: any) =>
      w.id === warningId && w.studentId === payload.id ? { ...w, isRead: true } : w
    );
    await fs.writeFile(WARNINGS_PATH, JSON.stringify(warnings, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
