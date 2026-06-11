import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ATTENDANCE_PATH = path.join(process.cwd(), "data", "attendance.json");
const LESSONS_PATH    = path.join(process.cwd(), "data", "lessons.json");

function verifyToken(token: string) {
  try {
    const d = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (d.exp < Date.now()) return null;
    return d;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const token    = request.nextUrl.searchParams.get("token") || "";
    const lessonId = request.nextUrl.searchParams.get("lessonId") || "";
    const payload  = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const attendance = JSON.parse(await fs.readFile(ATTENDANCE_PATH, "utf-8"));

    if (lessonId) {
      return NextResponse.json({ attendance: attendance.filter((a: any) => a.lessonId === lessonId) });
    }
    return NextResponse.json({ attendance: attendance.filter((a: any) => a.professorId === payload.id) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: save/update attendance for a lesson
// body: { lessonId, records: [{studentId, studentName, status: "present"|"absent"|"late"}] }
export async function POST(request: NextRequest) {
  try {
    const token   = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId, records } = await request.json();
    if (!lessonId || !Array.isArray(records)) return NextResponse.json({ error: "lessonId and records are required" }, { status: 400 });

    // Verify lesson belongs to this professor
    const lessons = JSON.parse(await fs.readFile(LESSONS_PATH, "utf-8"));
    const lesson  = lessons.find((l: any) => l.id === lessonId);
    if (!lesson || lesson.professorId !== payload.id) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    const attendance = JSON.parse(await fs.readFile(ATTENDANCE_PATH, "utf-8"));
    // Remove old records for this lesson then insert fresh ones
    const other = attendance.filter((a: any) => a.lessonId !== lessonId);
    const newRecords = records.map((r: any) => ({
      id:            Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      lessonId,
      lessonTitle:   lesson.title,
      lessonDate:    lesson.date,
      professorId:   payload.id,
      studentId:     r.studentId,
      studentName:   r.studentName || "",
      status:        r.status || "absent",
      recordedAt:    new Date().toISOString(),
    }));
    await fs.writeFile(ATTENDANCE_PATH, JSON.stringify([...other, ...newRecords], null, 2), "utf-8");
    return NextResponse.json({ ok: true, count: newRecords.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
