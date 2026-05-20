import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");
const SECRET = process.env.ADMIN_SECRET || "opencode-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    const admins = JSON.parse(raw);

    const admin = admins.find(
      (a: any) => a.username === username && a.password === password
    );

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = Buffer.from(
      JSON.stringify({
        username: admin.username,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString("base64");

    return NextResponse.json({ ok: true, token, username: admin.username });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
