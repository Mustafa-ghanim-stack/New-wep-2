import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PAYMENTS_PATH = path.join(process.cwd(), "data", "payments.json");
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

    let payments: any[] = [];
    try { payments = JSON.parse(await fs.readFile(PAYMENTS_PATH, "utf-8")); } catch {}

    const record = payments.find((p: any) => p.studentId === student.id) || null;
    return NextResponse.json({ payment: record });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
