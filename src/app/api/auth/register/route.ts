import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");
const SECRET = process.env.ADMIN_SECRET || "opencode-secret-key";

function verifyToken(token: string): { username: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.exp < Date.now()) return null;
    return { username: decoded.username };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!auth || !verifyToken(auth)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    const admins = JSON.parse(raw);

    if (admins.some((a: any) => a.username === username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    admins.push({ username, password });
    await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2), "utf-8");

    const token = Buffer.from(
      JSON.stringify({
        username,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString("base64");

    return NextResponse.json({ ok: true, token, username });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
