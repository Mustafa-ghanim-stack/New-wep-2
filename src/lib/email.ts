import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";

const SMTP_PATH = path.join(process.cwd(), "data", "smtp.json");

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

let cachedConfig: SmtpConfig | null = null;

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const raw = await fs.readFile(SMTP_PATH, "utf-8");
  cachedConfig = JSON.parse(raw);
  return cachedConfig!;
}

export function clearSmtpCache() {
  cachedConfig = null;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const config = await getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    tls: { rejectUnauthorized: false },
    auth: { user: config.user, pass: config.pass },
  });
  await transporter.sendMail({
    from: `"${config.fromName}" <${config.from}>`,
    to,
    subject,
    html,
  });
}
