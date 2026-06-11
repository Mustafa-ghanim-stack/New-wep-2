import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ATTENDANCE_PATH = path.join(process.cwd(), "data", "attendance.json");
const STUDENTS_PATH   = path.join(process.cwd(), "data", "students.json");

function verifyToken(token: string) {
  try {
    const d = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (d.exp < Date.now()) return null;
    return d;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const token   = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const students   = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));
    const student    = students.find((s: any) => s.id === payload.id || s.email === payload.email);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const attendance = JSON.parse(await fs.readFile(ATTENDANCE_PATH, "utf-8"));
    const mine       = attendance.filter((a: any) => a.studentId === student.id);

    return NextResponse.json({ attendance: mine });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
