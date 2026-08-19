import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { REPORTS } from "@/lib/reports/schemas";
import EvidenceBrowser from "./EvidenceBrowser";

export default async function EvidencePage({ params }: { params: Promise<{ plant: string }> }) {
  const { plant: plantSlug } = await params;
  const plant = getPlant(plantSlug);
  if (!plant) notFound();

  // Solo tiene sentido filtrar por reportes que pueden llevar foto.
  const withPhotos = REPORTS.filter((r) =>
    r.sections.some((s) => s.fields.some((f) => f.type === "photo"))
  ).map((r) => ({ code: r.code, title: r.title }));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Link
        href={`/${plant.slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft size={16} /> {plant.fullName}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Evidencias — {plant.name}</h1>
        <p className="text-slate-500">
          Fotografías capturadas por los operadores, filtradas por reporte y fecha.
        </p>
      </div>

      <EvidenceBrowser plant={plant.slug} reports={withPhotos} />
    </main>
  );
}
