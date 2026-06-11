import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STUDENTS_PATH    = path.join(process.cwd(), "data", "students.json");
const PROFESSORS_PATH  = path.join(process.cwd(), "data", "professors.json");

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

    const professors = JSON.parse(await fs.readFile(PROFESSORS_PATH, "utf-8"));
    const prof = professors.find((p: any) => p.id === payload.id || p.email === payload.email);
    if (!prof) return NextResponse.json({ error: "Professor not found" }, { status: 404 });

    const department = prof.department || prof.specialization || "";
    const students = JSON.parse(await fs.readFile(STUDENTS_PATH, "utf-8"));

    const filtered = department
      ? students.filter((s: any) =>
          (s.department && s.department.includes(department)) ||
          (department && s.department === department)
        )
      : students;

    return NextResponse.json({ students: filtered.map((s: any) => ({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      phone: s.phone || "",
      department: s.department || "",
      branch: s.branch || "",
      status: s.status,
      createdAt: s.createdAt,
    }))});
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
