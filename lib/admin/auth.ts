import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_USERNAME = "taproadmin";
const ADMIN_PASSWORD = "Tapro@123";

const COOKIE_NAME = "tapro_admin";
const SESSION_SECONDS = 60 * 60 * 8;

// Derived from the static credentials unless a dedicated secret is configured.
const SECRET = process.env.ADMIN_SESSION_SECRET ?? `tapro-admin:${ADMIN_USERNAME}:${ADMIN_PASSWORD}`;

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkCredentials(username: string, password: string) {
  // Both comparisons always run so timing does not reveal which field was wrong.
  const userOk = safeEqual(username, ADMIN_USERNAME);
  const passOk = safeEqual(password, ADMIN_PASSWORD);
  return userOk && passOk;
}

export async function createSession() {
  const expires = Date.now() + SESSION_SECONDS * 1000;
  const payload = `${ADMIN_USERNAME}.${expires}`;
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [user, expires, signature] = value.split(".");
  if (!user || !expires || !signature) return false;
  if (!safeEqual(signature, sign(`${user}.${expires}`))) return false;
  return user === ADMIN_USERNAME && Number(expires) > Date.now();
}

/** Guard for every server action and route handler that mutates content. */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
