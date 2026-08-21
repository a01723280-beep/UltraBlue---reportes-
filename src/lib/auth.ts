// Dos puertas con contraseña compartida, no cuentas por persona:
//
//   operador  (APP_PASSWORD)    llenar reportes
//   admin     (ADMIN_PASSWORD)  descargas, evidencias, trazabilidad y borrado
//
// Cada una tiene su cookie, firmada con un HMAC de su expiración para que no
// se pueda falsificar desde el navegador. La contraseña es a la vez la llave
// de firma: cambiarla invalida todas las sesiones abiertas de ese nivel.

export type Nivel = "operador" | "admin";

export const SESSION_COOKIE: Record<Nivel, string> = {
  operador: "ub_session",
  admin: "ub_admin",
};

export const SESSION_MAX_AGE: Record<Nivel, number> = {
  operador: 60 * 60 * 24 * 30, // 30 días: el operador entra a diario
  admin: 60 * 60 * 12, // 12 horas: el acceso administrativo caduca el mismo día
};

const ENV_VAR: Record<Nivel, string> = {
  operador: "APP_PASSWORD",
  admin: "ADMIN_PASSWORD",
};

/** Si falta la variable, nadie puede entrar nunca: es un error de despliegue,
 * y quien llama lo reporta como tal en vez de dejar escapar un 500 opaco. */
export function isConfigured(nivel: Nivel): boolean {
  const value = process.env[ENV_VAR[nivel]];
  return typeof value === "string" && value !== "";
}

function secret(nivel: Nivel): string {
  const value = process.env[ENV_VAR[nivel]];
  if (!value) throw new Error(`Falta la variable de entorno ${ENV_VAR[nivel]}.`);
  return value;
}

async function sign(nivel: Nivel, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret(nivel)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(nivel: Nivel): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE[nivel] * 1000;
  return `${expiresAt}.${await sign(nivel, String(expiresAt))}`;
}

export async function verifySessionToken(nivel: Nivel, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAt, mac] = token.split(".");
  if (!expiresAt || !mac) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = await sign(nivel, expiresAt);
  return equalsConstantTime(expected, mac);
}

export function passwordMatches(nivel: Nivel, candidate: string): boolean {
  return equalsConstantTime(secret(nivel), candidate);
}

/** Comparación de tiempo constante: si saliera en el primer byte distinto, el
 * tiempo de respuesta delataría cuántos caracteres se acertaron. */
function equalsConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
