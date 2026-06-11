import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CODES_PATH = path.join(process.cwd(), "data", "verification_codes.json");
const STUDENTS_PATH = path.join(process.cwd(), "data", "students.json");

export async function POST(request: NextRequest) {
  try {
    const { email, code, fullName, phone, department, branch, password } = await request.json();

    if (!email || !code || !fullName || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const raw = await fs.readFile(CODES_PATH, "utf-8");
    const codes = JSON.parse(raw);

    const matchIdx = codes.findIndex(
      (c: any) => c.email === email && c.code === code && c.expiresAt > Date.now()
    );

    if (matchIdx === -1) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    codes.splice(matchIdx, 1);
    await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2), "utf-8");

    const studentsRaw = await fs.readFile(STUDENTS_PATH, "utf-8");
    const students = JSON.parse(studentsRaw);

    if (students.some((s: any) => s.email === email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    if (phone && students.some((s: any) => s.phone === phone)) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }

    const student = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      fullName,
      phone,
      email,
      department: department || "",
      branch: branch || "",
      password,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    students.push(student);
    await fs.writeFile(STUDENTS_PATH, JSON.stringify(students, null, 2), "utf-8");

    return NextResponse.json({ ok: true, message: "Registration successful! Awaiting approval." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
