"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, ImageOff, Loader2, X } from "lucide-react";

interface StoredPhoto {
  name: string;
  dataUrl: string;
}

interface EvidenceItem {
  submissionId: string;
  reportType: string;
  reportTitle: string;
  createdAt: string;
  operator: string | null;
  fieldLabel: string;
  photos: StoredPhoto[];
}

interface Props {
  plant: string;
  reports: { code: string; title: string }[];
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

export default function EvidenceBrowser({ plant, reports }: Props) {
  const [reportType, setReportType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<{ photo: StoredPhoto; item: EvidenceItem } | null>(null);

  // El spinner lo encienden los filtros al cambiar (abajo); el efecto solo
  // trae los datos, para no disparar renders en cascada.
  useEffect(() => {
    let cancelled = false;
    const qs = new URLSearchParams({ plant });
    if (reportType) qs.set("reportType", reportType);
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);

    fetch(`/api/evidencias?${qs}`)
      .then((res) => res.json())
      .catch(() => ({ items: [] }))
      .then((body) => {
        if (cancelled) return;
        setItems(body.items ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [plant, reportType, from, to]);

  const applyFilter = useCallback((apply: () => void) => {
    setLoading(true);
    apply();
  }, []);

  // Cerrar el visor con Escape, que es el gesto que espera cualquiera.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const totalPhotos = items.reduce((n, i) => n + i.photos.length, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Reporte</span>
          <select
            value={reportType}
            onChange={(e) => applyFilter(() => setReportType(e.target.value))}
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

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Desde</span>
          <input
            type="date"
            value={from}
            onChange={(e) => applyFilter(() => setFrom(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Hasta</span>
          <input
            type="date"
            value={to}
            onChange={(e) => applyFilter(() => setTo(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>

        {(reportType || from || to) && (
          <button
            type="button"
            onClick={() =>
              applyFilter(() => {
                setReportType("");
                setFrom("");
                setTo("");
              })
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Limpiar
          </button>
        )}

        <span className="ml-auto text-sm text-slate-500">
          {loading ? "Buscando…" : `${totalPhotos} foto${totalPhotos === 1 ? "" : "s"}`}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Cargando evidencias…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16 text-slate-400">
          <ImageOff size={28} />
          <p className="text-sm">No hay evidencias fotográficas con esos filtros.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={`${item.submissionId}-${item.fieldLabel}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-sky-600">{item.reportType}</span>
                <span className="text-sm font-medium text-slate-800">{item.reportTitle}</span>
                <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
                {item.operator && (
                  <span className="text-xs text-slate-500">· {item.operator}</span>
                )}
              </div>
              <p className="mb-2 text-xs text-slate-500">{item.fieldLabel}</p>
              <div className="flex flex-wrap gap-3">
                {item.photos.map((photo, i) => (
                  <button
                    key={`${photo.name}-${i}`}
                    type="button"
                    onClick={() => setZoom({ photo, item })}
                    className="overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-2 hover:ring-sky-400"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.dataUrl}
                      alt={photo.name}
                      className="h-28 w-28 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6"
          onClick={() => setZoom(null)}
        >
          <div
            className="flex max-h-full w-full max-w-3xl flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {zoom.item.reportType} · {zoom.item.fieldLabel}
                </p>
                <p className="truncate text-xs text-slate-300">
                  {formatDateTime(zoom.item.createdAt)}
                  {zoom.item.operator ? ` · ${zoom.item.operator}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={zoom.photo.dataUrl}
                  download={`${zoom.item.reportType}_${zoom.item.createdAt.slice(0, 10)}_${zoom.photo.name}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
                >
                  <Download size={16} /> Descargar
                </a>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setZoom(null)}
                  className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoom.photo.dataUrl}
              alt={zoom.photo.name}
              className="max-h-[75vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
