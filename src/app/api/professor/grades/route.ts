import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const GRADES_PATH = path.join(process.cwd(), "data", "grades.json");

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

    let grades: any[] = [];
    try { grades = JSON.parse(await fs.readFile(GRADES_PATH, "utf-8")); } catch {}
    grades = grades.filter((g: any) => g.professorId === payload.id);

    return NextResponse.json({ grades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { examId, records } = await request.json();
    if (!examId || !Array.isArray(records))
      return NextResponse.json({ error: "examId and records required" }, { status: 400 });

    let grades: any[] = [];
    try { grades = JSON.parse(await fs.readFile(GRADES_PATH, "utf-8")); } catch {}

    grades = grades.filter((g: any) => !(g.examId === examId && g.professorId === payload.id));

    const now = new Date().toISOString();
    const newGrades = records
      .filter((r: any) => r.result === "pass" || r.result === "fail")
      .map((r: any) => ({
        id: `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        examId,
        studentId: r.studentId,
        studentName: r.studentName || "",
        result: r.result,
        professorId: payload.id,
        recordedAt: now,
      }));

    await fs.writeFile(GRADES_PATH, JSON.stringify([...grades, ...newGrades], null, 2));
    return NextResponse.json({ ok: true, count: newGrades.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
