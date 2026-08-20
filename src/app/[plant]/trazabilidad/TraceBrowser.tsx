"use client";

import { useState } from "react";
import { Loader2, PackageSearch, Search } from "lucide-react";

interface Eslabon {
  id: string;
  reportType: string;
  reportTitle: string;
  createdAt: string;
  operator: string | null;
  resumen: { etiqueta: string; valor: string }[];
}

interface Traza {
  lote: string | null;
  loteUrea: string | null;
  origen: Eslabon[];
  produccion: Eslabon[];
  calidad: Eslabon[];
  envasado: Eslabon[];
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

const ETAPAS: { clave: keyof Traza; titulo: string; color: string }[] = [
  { clave: "origen", titulo: "Origen — recepción de la urea", color: "bg-amber-500" },
  { clave: "produccion", titulo: "Producción — mezclado", color: "bg-sky-500" },
  { clave: "calidad", titulo: "Calidad", color: "bg-violet-500" },
  { clave: "envasado", titulo: "Envasado", color: "bg-emerald-500" },
];

export default function TraceBrowser({ plant, lotes }: { plant: string; lotes: string[] }) {
  const [lote, setLote] = useState("");
  const [traza, setTraza] = useState<Traza | null>(null);
  const [loading, setLoading] = useState(false);

  async function buscar(valor: string) {
    setLote(valor);
    if (!valor) {
      setTraza(null);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `/api/trazabilidad?plant=${plant}&lote=${encodeURIComponent(valor)}`
    );
    const body = await res.json().catch(() => null);
    setTraza(res.ok ? body : null);
    setLoading(false);
  }

  const totalEslabones = traza
    ? traza.origen.length + traza.produccion.length + traza.calidad.length + traza.envasado.length
    : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex min-w-64 flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Lote de producción</span>
          <select
            value={lote}
            onChange={(e) => buscar(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Selecciona un lote…</option>
            {lotes.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        {traza && !loading && (
          <span className="ml-auto text-sm text-slate-500">
            {totalEslabones} reporte{totalEslabones === 1 ? "" : "s"} en la cadena
          </span>
        )}
      </div>

      {lotes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
          <PackageSearch size={28} />
          <p className="max-w-sm text-sm">
            Todavía no hay lotes de producción. Se emiten solos al guardar un reporte de mezclado
            (PO-03).
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Rastreando el lote…
        </div>
      ) : !traza ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16 text-slate-400">
          <Search size={28} />
          <p className="text-sm">Elige un lote para ver su recorrido.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Lote de producción
            </p>
            <p className="font-mono text-lg font-bold text-slate-900">{traza.lote}</p>
            <p className="mt-1 text-sm text-slate-500">
              {traza.loteUrea ? (
                <>
                  Producido con la urea del lote{" "}
                  <strong className="font-mono text-slate-700">{traza.loteUrea}</strong>
                </>
              ) : (
                "Sin mezclado registrado: no se puede rastrear su origen."
              )}
            </p>
          </div>

          {ETAPAS.map(({ clave, titulo, color }) => {
            const eslabones = traza[clave] as Eslabon[];
            return (
              <div key={clave}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <h2 className="text-sm font-semibold text-slate-800">{titulo}</h2>
                  <span className="text-xs text-slate-400">({eslabones.length})</span>
                </div>

                {eslabones.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                    Sin reportes en esta etapa.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {eslabones.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-sm font-semibold text-sky-600">{e.reportType}</span>
                          <span className="text-sm font-medium text-slate-800">{e.reportTitle}</span>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(e.createdAt)}
                          </span>
                          {e.operator && (
                            <span className="text-xs text-slate-500">· {e.operator}</span>
                          )}
                        </div>
                        {e.resumen.length > 0 && (
                          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                            {e.resumen.map((r) => (
                              <div key={r.etiqueta} className="flex justify-between gap-3 text-sm">
                                <dt className="text-slate-500">{r.etiqueta}</dt>
                                <dd className="text-right font-medium text-slate-800">{r.valor}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
