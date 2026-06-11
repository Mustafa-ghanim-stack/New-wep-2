import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken, extractToken, comparePassword, hashPassword } from "@/lib/auth";

const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");

function auth(request: NextRequest) {
  const token = extractToken(request);
  return token ? verifyToken(token) : null;
}

export async function GET(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    const admins = JSON.parse(raw);
    // Never return passwords
    const safe = admins.map(({ password: _p, ...rest }: any) => rest);
    return NextResponse.json({ admins: safe });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const caller = auth(request);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { username, oldPassword, newPassword } = await request.json();
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    const admins = JSON.parse(raw);
    const idx = admins.findIndex((a: any) => a.username === username);
    if (idx === -1) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await comparePassword(oldPassword, admins[idx].password);
    if (!valid) return NextResponse.json({ error: "Old password is incorrect" }, { status: 401 });

    admins[idx].password = await hashPassword(newPassword);
    await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { username, newUsername, newPassword, displayName, email, role, permissions } = body;
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const ALLOWED_ROLES = ["superadmin", "admin", "moderator", "viewer"];
    if (role && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    const admins = JSON.parse(raw);
    const idx = admins.findIndex((a: any) => a.username === username);
    if (idx === -1) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    if (newUsername && newUsername !== username) {
      if (newUsername.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
        return NextResponse.json({ error: "Username must be 3+ alphanumeric characters" }, { status: 400 });
      }
      if (admins.some((a: any) => a.username === newUsername)) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
      admins[idx].username = newUsername;
    }
    if (newPassword) admins[idx].password = await hashPassword(newPassword);
    if (displayName !== undefined) admins[idx].displayName = String(displayName).slice(0, 100);
    if (email !== undefined) admins[idx].email = String(email).slice(0, 200);
    if (role !== undefined) admins[idx].role = role;
    if (permissions !== undefined) admins[idx].permissions = permissions;
    await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2), "utf-8");
    return NextResponse.json({ ok: true, newUsername: admins[idx].username });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
    const raw = await fs.readFile(ADMINS_PATH, "utf-8");
    let admins = JSON.parse(raw);
    admins = admins.filter((a: any) => a.username !== username);
    await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
