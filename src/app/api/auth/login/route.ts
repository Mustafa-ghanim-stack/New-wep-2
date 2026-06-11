import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { signToken, comparePassword, hashPassword } from "@/lib/auth";

const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    const admins = JSON.parse(raw);

    const admin = admins.find(
      (a: any) => a.username.toLowerCase() === username.toLowerCase()
    );

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Upgrade plaintext password to bcrypt hash on successful login
    if (!admin.password.startsWith("$2")) {
      admin.password = await hashPassword(password);
      await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2), "utf-8");
    }

    const token = signToken({ username: admin.username, role: admin.role });
    return NextResponse.json({ ok: true, token, username: admin.username, permissions: admin.permissions || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
