"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Camera, Inbox, Loader2, Trash2 } from "lucide-react";

interface Registro {
  id: string;
  reportType: string;
  reportTitle: string;
  createdAt: string;
  operator: string | null;
  lote: string | null;
  fotos: number;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RegistrosManager({
  plant,
  reports,
}: {
  plant: string;
  reports: { code: string; title: string }[];
}) {
  const [reportType, setReportType] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // `recarga` sube tras borrar para volver a pedir la lista. El spinner lo
  // enciende quien dispara el cambio, no el efecto, para no encadenar renders.
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const qs = new URLSearchParams({ plant });
    if (reportType) qs.set("reportType", reportType);

    fetch(`/api/registros?${qs}`)
      .then((res) => res.json())
      .catch(() => ({ registros: [] }))
      .then((body) => {
        if (cancelado) return;
        setRegistros(body.registros ?? []);
        setSeleccion(new Set());
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [plant, reportType, recarga]);

  function alternar(id: string) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function borrar() {
    setBorrando(true);
    const res = await fetch("/api/registros", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plant, ids: [...seleccion] }),
    });
    const body = await res.json().catch(() => null);
    setBorrando(false);
    setConfirmando(false);
    setAviso(
      res.ok
        ? `Se borraron ${body.borrados} registro${body.borrados === 1 ? "" : "s"}.`
        : "No se pudo borrar. Intenta de nuevo."
    );
    setLoading(true);
    setRecarga((n) => n + 1);
  }

  const total = seleccion.size;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Reporte</span>
          <select
            value={reportType}
            onChange={(e) => {
              setLoading(true);
              setReportType(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Todos</option>
            {reports.map((r) => (
              <option key={r.code} value={r.code}>
                {r.code} · {r.title}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={total === 0}
          onClick={() => setConfirmando(true)}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={16} />
          Borrar {total > 0 ? `(${total})` : "seleccionados"}
        </button>
      </div>

      {aviso && (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {aviso}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Cargando registros…
        </div>
      ) : registros.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16 text-slate-400">
          <Inbox size={28} />
          <p className="text-sm">No hay registros con ese filtro.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {registros.map((r) => (
            <label
              key={r.id}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={seleccion.has(r.id)}
                onChange={() => alternar(r.id)}
                className="h-4 w-4 shrink-0 accent-red-600"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-sky-600">{r.reportType}</span>
                  <span className="truncate text-sm text-slate-800">{r.reportTitle}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                  <span>{formatDateTime(r.createdAt)}</span>
                  {r.operator && <span>· {r.operator}</span>}
                  {r.lote && <span className="font-mono">· {r.lote}</span>}
                  {r.fotos > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Camera size={12} /> {r.fotos}
                    </span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              <h2 className="text-lg font-bold">Confirmar borrado</h2>
            </div>
            <p className="text-sm text-slate-600">
              Vas a borrar <strong>{total}</strong> registro{total === 1 ? "" : "s"} de forma
              permanente, junto con sus fotografías. Esta acción no se puede deshacer y los datos
              no aparecerán más en descargas ni en trazabilidad.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={borrar}
                disabled={borrando}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {borrando && <Loader2 size={14} className="animate-spin" />}
                Sí, borrar {total}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
