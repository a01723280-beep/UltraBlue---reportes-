import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Todo queda detrás de la contraseña de operador, salvo las dos pantallas de
// acceso y los assets estáticos.
export const config = {
  matcher: ["/((?!login|admin|api/login|api/admin-login|_next/static|_next/image|favicon.ico).*)"],
};

/** Consultar o borrar lo capturado es trabajo administrativo: llenar reportes
 * no debería alcanzar para descargar el histórico ni para borrarlo. */
const RUTAS_ADMIN = [
  /^\/[^/]+\/descargas/,
  /^\/[^/]+\/evidencias/,
  /^\/[^/]+\/trazabilidad/,
  /^\/[^/]+\/registros/,
  /^\/api\/export/,
  /^\/api\/evidencias/,
  /^\/api\/trazabilidad/,
  /^\/api\/registros/,
];

export async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;
  const destino = ruta + request.nextUrl.search;

  const tieneOperador = await verifySessionToken(
    "operador",
    request.cookies.get(SESSION_COOKIE.operador)?.value
  );
  if (!tieneOperador) return redirigir(request, "/login", destino);

  if (RUTAS_ADMIN.some((r) => r.test(ruta))) {
    const tieneAdmin = await verifySessionToken(
      "admin",
      request.cookies.get(SESSION_COOKIE.admin)?.value
    );
    if (!tieneAdmin) return redirigir(request, "/admin", destino);
  }

  return NextResponse.next();
}

function redirigir(request: NextRequest, a: string, destino: string) {
  const url = new URL(a, request.url);
  // Para volver a donde iba en cuanto se autentique.
  if (destino && destino !== "/") url.searchParams.set("next", destino);
  return NextResponse.redirect(url);
}
