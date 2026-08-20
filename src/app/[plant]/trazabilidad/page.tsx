import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { prisma } from "@/lib/prisma";
import { LIST } from "@/lib/reports/options";
import TraceBrowser from "./TraceBrowser";

export default async function TrazabilidadPage({
  params,
}: {
  params: Promise<{ plant: string }>;
}) {
  const { plant: plantSlug } = await params;
  const plant = getPlant(plantSlug);
  if (!plant) notFound();

  const lotes = await prisma.masterListItem.findMany({
    where: { plantId: plant.slug, listKey: LIST.lotesProduccion },
    orderBy: { label: "desc" },
    select: { label: true },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href={`/${plant.slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft size={16} /> {plant.fullName}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Trazabilidad — {plant.name}</h1>
        <p className="text-slate-500">
          Elige un lote de producción para ver su recorrido, desde la urea que se recibió hasta
          el producto envasado.
        </p>
      </div>

      <TraceBrowser plant={plant.slug} lotes={lotes.map((l) => l.label)} />
    </main>
  );
}
