import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { REPORTS } from "@/lib/reports/schemas";
import RegistrosManager from "./RegistrosManager";

export default async function RegistrosPage({
  params,
}: {
  params: Promise<{ plant: string }>;
}) {
  const { plant: plantSlug } = await params;
  const plant = getPlant(plantSlug);
  if (!plant) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href={`/${plant.slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft size={16} /> {plant.fullName}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Borrar registros — {plant.name}</h1>
        <p className="text-slate-500">
          Elimina reportes capturados por error. Lo borrado no se puede recuperar.
        </p>
      </div>

      <RegistrosManager
        plant={plant.slug}
        reports={REPORTS.map((r) => ({ code: r.code, title: r.title }))}
      />
    </main>
  );
}
