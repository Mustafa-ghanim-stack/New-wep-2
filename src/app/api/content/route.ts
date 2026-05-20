import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const messagesDir = path.join(process.cwd(), "messages");
const globalsCssPath = path.join(process.cwd(), "src", "app", "globals.css");
const ADMINS_PATH = path.join(process.cwd(), "data", "admins.json");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function verifyToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function isAuthorized(request: NextRequest): boolean {
  const pwd = request.nextUrl.searchParams.get("pwd");
  if (pwd === ADMIN_PASSWORD) return true;
  const token = request.nextUrl.searchParams.get("token");
  if (token && verifyToken(token)) return true;
  return false;
}

async function readJson(locale: string) {
  const p = path.join(messagesDir, `${locale}.json`);
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw);
}

async function writeJson(locale: string, data: any) {
  const p = path.join(messagesDir, `${locale}.json`);
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

async function readCssVars() {
  const raw = await fs.readFile(globalsCssPath, "utf-8");
  const themeBlock = raw.match(/@theme\s*\{([^}]+)\}/)?.[1] || "";
  const vars: Record<string, string> = {};
  for (const line of themeBlock.split("\n")) {
    const m = line.match(/--(\S+):\s*([^;]+);/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return { raw, vars };
}

async function writeCssVars(vars: Record<string, string>) {
  let raw = await fs.readFile(globalsCssPath, "utf-8");
  if (!/@theme\s*\{[\s\S]*?\}/.test(raw)) {
    raw = raw.replace(
      /(@import\s+["']tailwindcss["']\s*;?\s*)/,
      `$1\n\n@theme {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")}\n}\n`
    );
  } else {
    raw = raw.replace(/@theme\s*\{([\s\S]*?)\}/, (_match, block: string) => {
      let newBlock = "@theme {\n";
      const existing = new Map<string, string>();
      for (const line of block.split("\n")) {
        const m = line.match(/(--\S+):\s*[^;]+;/);
        if (m) existing.set(m[1], line);
      }
      for (const [k, v] of Object.entries(vars)) {
        newBlock += `  --${k}: ${v};\n`;
        existing.delete(`--${k}`);
      }
      for (const [, line] of existing) {
        newBlock += line + "\n";
      }
      return newBlock;
    });
  }
  await fs.writeFile(globalsCssPath, raw, "utf-8");
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const ar = await readJson("ar");
    const en = await readJson("en");
    const { vars } = await readCssVars();
    return NextResponse.json({ ar, en, theme: vars });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (body.ar) await writeJson("ar", body.ar);
    if (body.en) await writeJson("en", body.en);
    if (body.theme) await writeCssVars(body.theme);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
