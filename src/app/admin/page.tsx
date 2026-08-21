import { Suspense } from "react";
import PasswordGate from "@/components/PasswordGate";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
      <Suspense>
        <PasswordGate
          endpoint="/api/admin-login"
          variante="admin"
          titulo="Acceso administrativo"
          descripcion="Consultar, descargar y borrar registros requiere la contraseña de administración."
        />
      </Suspense>
    </main>
  );
}
