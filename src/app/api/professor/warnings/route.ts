import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WARNINGS_PATH = path.join(process.cwd(), "data", "warnings.json");

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

    const studentId = request.nextUrl.searchParams.get("studentId");
    let warnings: any[] = [];
    try { warnings = JSON.parse(await fs.readFile(WARNINGS_PATH, "utf-8")); } catch {}

    const result = studentId
      ? warnings.filter((w: any) => w.studentId === studentId)
      : warnings;
    return NextResponse.json({ warnings: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { studentId, type, message, severity } = await request.json();
    if (!studentId || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    let warnings: any[] = [];
    try { warnings = JSON.parse(await fs.readFile(WARNINGS_PATH, "utf-8")); } catch {}

    const newWarning = {
      id: `wrn${Date.now()}`,
      studentId,
      type: type || "عام",
      message,
      date: new Date().toISOString().slice(0, 10),
      isRead: false,
      severity: severity || "medium",
      sentBy: payload.id,
    };
    warnings.push(newWarning);
    await fs.writeFile(WARNINGS_PATH, JSON.stringify(warnings, null, 2));
    return NextResponse.json({ ok: true, warning: newWarning });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { warningId } = await request.json();
    let warnings: any[] = [];
    try { warnings = JSON.parse(await fs.readFile(WARNINGS_PATH, "utf-8")); } catch {}

    warnings = warnings.filter((w: any) => w.id !== warningId);
    await fs.writeFile(WARNINGS_PATH, JSON.stringify(warnings, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
