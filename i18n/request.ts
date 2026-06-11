import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { promises as fs } from "fs";
import path from "path";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "ar" | "en")) {
    locale = routing.defaultLocale;
  }

  let messages: any;
  try {
    // Try fs first (works in dev and when files are writable)
    const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    messages = JSON.parse(raw);
  } catch {
    // Fallback to static import (works on Netlify/Vercel serverless)
    messages = (await import(`../messages/${locale}.json`)).default;
  }

  return { locale, messages };
});
