import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPlant } from "@/lib/plants";
import { getReportDef, allFieldsOf } from "@/lib/reports/schemas";
import { prisma } from "@/lib/prisma";
import ReportFormLoader from "@/components/ReportFormLoader";

export default async function ReportFormPage({
  params,
}: {
  params: Promise<{ plant: string; reportType: string }>;
}) {
  const { plant: plantSlug, reportType } = await params;
  const plant = getPlant(plantSlug);
  const report = getReportDef(reportType);
  if (!plant || !report) notFound();

  const listKeys = Array.from(
    new Set(allFieldsOf(report).filter((f) => f.type === "master-select" && f.listKey).map((f) => f.listKey as string))
  );

  const items = listKeys.length
    ? await prisma.masterListItem.findMany({
        where: { plantId: plant.slug, listKey: { in: listKeys } },
        orderBy: { label: "asc" },
      })
    : [];

  const initialLists: Record<string, string[]> = {};
  for (const key of listKeys) initialLists[key] = [];
  for (const item of items) initialLists[item.listKey]?.push(item.label);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link href={`/${plant.slug}`} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronLeft size={16} /> {plant.fullName}
      </Link>

      <div className="mb-8">
        <span className="text-xs font-semibold text-sky-600">{report.code}</span>
        <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
      </div>

      <ReportFormLoader reportCode={report.code} plant={plant.slug} initialLists={initialLists} />
    </main>
  );
}
