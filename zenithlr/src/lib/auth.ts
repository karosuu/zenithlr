import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "zenith_admin";

function secret() {
  return process.env.SESSION_SECRET || "zenith-dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "management@zenithlr.com",
    password: process.env.ADMIN_PASSWORD || "zenith2026",
  };
}

export async function createSession(email: string) {
  const token = `${email}.${sign(email)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionEmail() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const lastDot = raw.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const email = raw.slice(0, lastDot);
  const hash = raw.slice(lastDot + 1);
  const expected = sign(email);
  const a = Buffer.from(hash);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return email;
}

export async function requireAdmin() {
  const email = await getSessionEmail();
  if (!email) {
    throw new Error("UNAUTHORIZED");
  }
  return email;
}
