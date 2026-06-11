import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");
const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");

function verifyToken(token: string): { username: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.exp < Date.now()) return null;
    return { username: decoded.username };
  } catch {
    return null;
  }
}

async function getStudents() {
  const raw = await fs.readFile(STUDENTS_PATH, "utf-8");
  return JSON.parse(raw);
}

async function saveStudents(students: any[]) {
  await fs.writeFile(STUDENTS_PATH, JSON.stringify(students, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const students = await getStudents();
    return NextResponse.json({ students });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth || !verifyToken(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, action, data } = await request.json();
    const students = await getStudents();
    const idx = students.findIndex((s: any) => s.id === id);

    if (action === "add") {
      const newStudent = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        department: data.department || "",
        branch: data.branch || "",
        password: data.password || "",
        status: "approved",
        createdAt: new Date().toISOString(),
      };
      students.push(newStudent);
      await saveStudents(students);
      return NextResponse.json({ ok: true, student: newStudent });
    }

    if (idx === -1) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    if (action === "approve") {
      students[idx].status = "approved";
    } else if (action === "reject") {
      students[idx].status = "rejected";
    } else if (action === "delete") {
      students.splice(idx, 1);
    } else if (action === "update") {
      if (data) Object.assign(students[idx], data);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await saveStudents(students);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
