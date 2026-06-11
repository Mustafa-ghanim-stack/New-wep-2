import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const COUNTER_PATH = path.join(process.cwd(), "data", "counter.json");

const FIVE_MIN = 5 * 60 * 1000;
const getToday = () => new Date().toISOString().slice(0, 10);

interface CounterData {
  totalViews: number;
  todayViews: number;
  date: string;
  sessions: { ip: string; time: number }[];
}

async function readCounter(): Promise<CounterData> {
  try {
    const raw = await fs.readFile(COUNTER_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { totalViews: 0, todayViews: 0, date: getToday(), sessions: [] };
  }
}

async function writeCounter(data: CounterData): Promise<void> {
  await fs.writeFile(COUNTER_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "::1"
  );
}

async function getStats(request: NextRequest) {
  const data = await readCounter();
  const ip = getClientIp(request);
  const now = Date.now();

  data.sessions = data.sessions.filter((s) => now - s.time < FIVE_MIN);

  const existing = data.sessions.find((s) => s.ip === ip);
  if (existing) {
    existing.time = now;
  } else {
    data.sessions.push({ ip, time: now });
  }

  const today = getToday();
  if (data.date !== today) {
    data.date = today;
    data.todayViews = 1;
    data.totalViews += 1;
  } else {
    data.todayViews += 1;
    data.totalViews += 1;
  }

  await writeCounter(data);

  return {
    visitorsNow: data.sessions.length,
    todayViews: data.todayViews,
    totalViews: data.totalViews,
  };
}

export async function GET(request: NextRequest) {
  try {
    const data = await readCounter();
    const now = Date.now();
    data.sessions = data.sessions.filter((s) => now - s.time < FIVE_MIN);
    return NextResponse.json({
      visitorsNow: data.sessions.length,
      todayViews: data.todayViews,
      totalViews: data.totalViews,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const stats = await getStats(request);
    return NextResponse.json(stats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
