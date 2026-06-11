import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LESSONS_PATH    = path.join(process.cwd(), "data", "lessons.json");
const PROFESSORS_PATH = path.join(process.cwd(), "data", "professors.json");

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

    const lessons = JSON.parse(await fs.readFile(LESSONS_PATH, "utf-8"));
    const mine = lessons.filter((l: any) => l.professorId === payload.id);
    return NextResponse.json({ lessons: mine });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, date, time, subject, type } = await request.json();
    if (!title || !date) return NextResponse.json({ error: "Title and date are required" }, { status: 400 });

    const professors = JSON.parse(await fs.readFile(PROFESSORS_PATH, "utf-8"));
    const prof = professors.find((p: any) => p.id === payload.id || p.email === payload.email);

    const lessons = JSON.parse(await fs.readFile(LESSONS_PATH, "utf-8"));
    const lesson = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      professorId: payload.id,
      professorName: prof?.fullName || "",
      department: prof?.department || prof?.specialization || "",
      title,
      description: description || "",
      subject: subject || "",
      date,
      time: time || "",
      type: type === "exam" ? "exam" : "lecture",
      createdAt: new Date().toISOString(),
    };
    lessons.push(lesson);
    await fs.writeFile(LESSONS_PATH, JSON.stringify(lessons, null, 2), "utf-8");
    return NextResponse.json({ ok: true, lesson });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    const lessons = JSON.parse(await fs.readFile(LESSONS_PATH, "utf-8"));
    const filtered = lessons.filter((l: any) => !(l.id === id && l.professorId === payload.id));
    await fs.writeFile(LESSONS_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
