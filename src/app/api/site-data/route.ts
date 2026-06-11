import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const arPath = path.join(process.cwd(), "messages", "ar.json");
    const enPath = path.join(process.cwd(), "messages", "en.json");
    const ar = JSON.parse(await fs.readFile(arPath, "utf-8"));
    const en = JSON.parse(await fs.readFile(enPath, "utf-8"));
    return NextResponse.json({ ar, en });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
