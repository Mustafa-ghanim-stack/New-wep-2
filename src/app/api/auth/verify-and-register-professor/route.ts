import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CODES_PATH      = path.join(process.cwd(), "data", "verification_codes.json");
const PROFESSORS_PATH = path.join(process.cwd(), "data", "professors.json");

export async function POST(request: NextRequest) {
  try {
    const { email, code, fullName, phone, specialization, password } = await request.json();

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

    const professorsRaw = await fs.readFile(PROFESSORS_PATH, "utf-8");
    const professors = JSON.parse(professorsRaw);

    if (professors.some((p: any) => p.email === email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const professor = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      fullName,
      phone: phone || "",
      email,
      specialization: specialization || "",
      password,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    professors.push(professor);
    await fs.writeFile(PROFESSORS_PATH, JSON.stringify(professors, null, 2), "utf-8");

    return NextResponse.json({ ok: true, message: "Registration successful! Awaiting approval." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
