import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, FileSpreadsheet } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { REPORTS } from "@/lib/reports/schemas";
import { prisma } from "@/lib/prisma";

export default async function DownloadsPage({ params }: { params: Promise<{ plant: string }> }) {
  const { plant: plantSlug } = await params;
  const plant = getPlant(plantSlug);
  if (!plant) notFound();

  const grouped = await prisma.reportSubmission.groupBy({
    by: ["reportType"],
    where: { plantId: plant.slug },
    _count: { _all: true },
    _max: { createdAt: true },
  });
  const stats = new Map(grouped.map((g) => [g.reportType, { count: g._count._all, last: g._max.createdAt }]));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link href={`/${plant.slug}`} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronLeft size={16} /> {plant.fullName}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Descargas — {plant.name}</h1>
        <p className="text-slate-500">Cada reporte se exporta como un archivo Excel con todas las respuestas registradas.</p>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {REPORTS.map((r) => {
          const stat = stats.get(r.code);
          const count = stat?.count ?? 0;
          const last = stat?.last;
          return (
            <div key={r.code} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    <span className="text-sky-600">{r.code}</span> · {r.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {count === 0
                      ? "Sin registros todavía"
                      : `${count} registro${count === 1 ? "" : "s"}${last ? ` · último ${formatDate(last)}` : ""}`}
                  </div>
                </div>
              </div>
              {count > 0 ? (
                <a
                  href={`/api/export?plant=${plant.slug}&reportType=${r.code}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Download size={16} /> Excel
                </a>
              ) : (
                <span className="shrink-0 rounded-lg bg-slate-100 px-3.5 py-2 text-sm text-slate-400">Excel</span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function formatDate(d: Date) {
  return new Date(d).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}
