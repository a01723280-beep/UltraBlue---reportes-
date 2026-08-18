import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, FlaskConical, Camera, Download, ChevronLeft } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { REPORTS } from "@/lib/reports/schemas";

export default async function PlantPage({ params }: { params: Promise<{ plant: string }> }) {
  const { plant: plantSlug } = await params;
  const plant = getPlant(plantSlug);
  if (!plant) notFound();

  const operacion = REPORTS.filter((r) => r.category === "operacion");
  const calidad = REPORTS.filter((r) => r.category === "calidad");
  const evidencias = REPORTS.filter((r) => r.category === "evidencias");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronLeft size={16} /> Cambiar de planta
      </Link>

      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">{plant.fullName}</h1>
        <p className="text-slate-500">Elige el reporte que vas a llenar.</p>
      </div>

      <Link
        href={`/${plant.slug}/descargas`}
        className="mb-8 flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sky-800 transition hover:border-sky-300 hover:bg-sky-100"
      >
        <span className="flex items-center gap-2 font-medium">
          <Download size={18} /> Descargar reportes en Excel
        </span>
        <ChevronLeft size={16} className="rotate-180" />
      </Link>

      <ReportGroup title="Reportes de operación" icon={<ClipboardList size={18} />} reports={operacion} plant={plant.slug} />
      <ReportGroup title="Reportes de calidad" icon={<FlaskConical size={18} />} reports={calidad} plant={plant.slug} />
      <ReportGroup title="Evidencias" icon={<Camera size={18} />} reports={evidencias} plant={plant.slug} />
    </main>
  );
}

function ReportGroup({
  title,
  icon,
  reports,
  plant,
}: {
  title: string;
  icon: React.ReactNode;
  reports: { code: string; title: string }[];
  plant: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {reports.map((r) => (
          <Link
            key={r.code}
            href={`/${plant}/reportes/${r.code}`}
            className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <span className="text-xs font-semibold text-sky-600">{r.code}</span>
            <span className="text-sm font-medium text-slate-800">{r.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
