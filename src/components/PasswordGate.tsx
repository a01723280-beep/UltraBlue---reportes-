"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

interface Props {
  /** A dónde se envía la contraseña. */
  endpoint: string;
  titulo: string;
  descripcion: string;
  variante: "operador" | "admin";
}

export default function PasswordGate({ endpoint, titulo, descripcion, variante }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const esAdmin = variante === "admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : "/");
      router.refresh();
      return;
    }

    setPending(false);
    const body = await res.json().catch(() => null);
    setError(body?.error ?? "Contraseña incorrecta.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    >
      <div
        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
          esAdmin ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
        }`}
      >
        {esAdmin ? <ShieldCheck size={22} /> : <Lock size={22} />}
      </div>
      <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">{descripcion}</p>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        autoFocus
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending || password === ""}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white transition disabled:opacity-50 ${
          esAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-sky-600 hover:bg-sky-700"
        }`}
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        Entrar
      </button>
    </form>
  );
}
