import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken, extractToken } from "@/lib/auth";

const CONTACTS_PATH = path.join(process.cwd(), "data", "contacts.json");

async function readContacts() {
  try {
    const raw = await fs.readFile(CONTACTS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function isAdmin(request: NextRequest) {
  const token = extractToken(request);
  return !!token && !!verifyToken(token);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;
    if (!name?.trim() || name.length > 100) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }
    if (!email?.trim() || !EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }
    if (message && message.length > 5000) {
      return NextResponse.json({ error: "الرسالة طويلة جداً" }, { status: 400 });
    }
    const contacts = await readContacts();
    contacts.unshift({
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim().slice(0, 30),
      message: (message || "").trim(),
      date: new Date().toISOString(),
      read: false,
    });
    await fs.writeFile(CONTACTS_PATH, JSON.stringify(contacts, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await readContacts());
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await request.json();
  const contacts = await readContacts();
  const idx = contacts.findIndex((c: any) => c.id === id);
  if (idx !== -1) contacts[idx].read = true;
  await fs.writeFile(CONTACTS_PATH, JSON.stringify(contacts, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await request.json();
  const contacts = await readContacts();
  const filtered = contacts.filter((c: any) => c.id !== id);
  await fs.writeFile(CONTACTS_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
