const COOKIE_NAME = "admin_sess";
const SESSION_DAYS = 7;

async function hmacHex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(password: string): Promise<string> {
  const ts = String(Date.now());
  const sig = await hmacHex(password, ts);
  return `${ts}.${sig}`;
}

export async function verifySessionToken(password: string, token: string): Promise<boolean> {
  try {
    const dot = token.indexOf(".");
    if (dot === -1) return false;
    const ts = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const age = Date.now() - Number(ts);
    if (!Number.isFinite(age) || age < 0 || age > SESSION_DAYS * 86400_000) return false;

    const expected = await hmacHex(password, ts);
    return timingSafeEqual(expected, sig);
  } catch {
    return false;
  }
}

export async function isAuthenticated(request: Request, env: any): Promise<boolean> {
  const password: string | undefined = env.ADMIN_PASSWORD;
  if (!password) return false; // no secret configured → always require login
  const token = getSessionCookie(request);
  if (!token) return false;
  return verifySessionToken(password, token);
}

export function getSessionCookie(request: Request): string | null {
  const cookies = request.headers.get("Cookie") ?? "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookieHeader(token: string): string {
  const maxAge = SESSION_DAYS * 86400;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/admin`;
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/admin`;
}
