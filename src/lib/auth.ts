// Shared-password gate. There are no user accounts: the plant shares one
// password, and a signed cookie proves it was entered. The cookie carries an
// HMAC of its expiry so it cannot be forged client-side.

export const SESSION_COOKIE = "ub_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

/** Whether the gate is usable at all. Callers surface this as a deployment
 * problem instead of letting it surface as an opaque 500. */
export function isConfigured(): boolean {
  return typeof process.env.APP_PASSWORD === "string" && process.env.APP_PASSWORD !== "";
}

function secret(): string {
  // APP_PASSWORD doubles as the signing key: rotating the password invalidates
  // every outstanding session, which is the behaviour we want here.
  const value = process.env.APP_PASSWORD;
  if (!value) throw new Error("Falta la variable de entorno APP_PASSWORD.");
  return value;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${await sign(String(expiresAt))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAt, mac] = token.split(".");
  if (!expiresAt || !mac) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = await sign(expiresAt);
  if (expected.length !== mac.length) return false;
  // Constant-time compare so a wrong cookie can't be brute-forced byte by byte.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ mac.charCodeAt(i);
  return diff === 0;
}

export function passwordMatches(candidate: string): boolean {
  const expected = secret();
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ candidate.charCodeAt(i);
  return diff === 0;
}
