import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const SALT_ROUNDS = 10;

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET environment variable is not set");
  return s;
}

export function signToken(payload: { username: string; role?: string }): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): { username: string; role?: string } | null {
  try {
    return jwt.verify(token, getSecret()) as { username: string; role?: string };
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  // Support legacy plaintext passwords during migration
  if (!hash.startsWith("$2")) return Promise.resolve(plain === hash);
  return bcrypt.compare(plain, hash);
}

export function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const url = new URL(request.url);
  return url.searchParams.get("token");
}
