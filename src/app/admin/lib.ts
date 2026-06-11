'use server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const msgDir = join(process.cwd(), 'messages');
const dataDir = join(process.cwd(), 'data');

export async function getMessages(lang: string) {
  const file = join(msgDir, `${lang}.json`);
  return JSON.parse(await readFile(file, 'utf-8'));
}

export async function saveMessages(lang: string, data: any) {
  const file = join(msgDir, `${lang}.json`);
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getData(name: string) {
  const file = join(dataDir, `${name}.json`);
  return JSON.parse(await readFile(file, 'utf-8'));
}

export async function saveData(name: string, data: any) {
  const file = join(dataDir, `${name}.json`);
  await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getTheme() {
  const cssPath = join(process.cwd(), 'src', 'app', 'globals.css');
  const css = await readFile(cssPath, 'utf-8');
  const theme: Record<string, string> = {};
  const regex = /--([\w-]+)\s*:\s*([^;]+)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    theme[match[1].trim()] = match[2].trim();
  }
  return theme;
}
