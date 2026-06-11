import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "professors.json");

function verifyToken(token: string) {
  try {
    const d = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return d.exp > Date.now();
  } catch { return false; }
}

function auth(req: NextRequest) {
  const t = req.headers.get("authorization")?.replace("Bearer ", "") || req.nextUrl.searchParams.get("token") || "";
  return verifyToken(t);
}

async function read() { return JSON.parse(await fs.readFile(FILE, "utf-8")); }
async function write(d: any[]) { await fs.writeFile(FILE, JSON.stringify(d, null, 2), "utf-8"); }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await read() });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, id, data } = await req.json();
  const items = await read();
  if (action === "add") {
    const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), createdAt: new Date().toISOString(), ...data };
    items.push(item);
    await write(items);
    return NextResponse.json({ ok: true, item });
  }
  const idx = items.findIndex((x: any) => x.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (action === "update") { Object.assign(items[idx], data); }
  else if (action === "delete") { items.splice(idx, 1); }
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  await write(items);
  return NextResponse.json({ ok: true });
}
