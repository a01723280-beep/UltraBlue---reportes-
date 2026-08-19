import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlantSlug } from "@/lib/plants";
import { getReportDef, allFieldsOf } from "@/lib/reports/schemas";
import { FormValues } from "@/lib/reports/types";

interface StoredPhoto {
  name: string;
  dataUrl: string;
}

export interface EvidenceItem {
  submissionId: string;
  reportType: string;
  reportTitle: string;
  createdAt: string;
  operator: string | null;
  fieldLabel: string;
  photos: StoredPhoto[];
}

function photosOf(raw: unknown): StoredPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is StoredPhoto =>
      typeof p?.dataUrl === "string" && p.dataUrl.startsWith("data:image/")
  );
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const plant = params.get("plant");
  const reportType = params.get("reportType");
  const from = params.get("from");
  const to = params.get("to");

  if (!plant || !isPlantSlug(plant)) {
    return NextResponse.json({ error: "Planta inválida." }, { status: 400 });
  }

  // `to` llega como fecha suelta; se incluye el día completo.
  const createdAt: { gte?: Date; lte?: Date } = {};
  if (from) createdAt.gte = new Date(`${from}T00:00:00`);
  if (to) createdAt.lte = new Date(`${to}T23:59:59.999`);

  const submissions = await prisma.reportSubmission.findMany({
    where: {
      plantId: plant,
      ...(reportType ? { reportType } : {}),
      ...(from || to ? { createdAt } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const items: EvidenceItem[] = [];
  for (const s of submissions) {
    const report = getReportDef(s.reportType);
    if (!report) continue;
    const data = (s.data ?? {}) as FormValues;
    for (const field of allFieldsOf(report)) {
      if (field.type !== "photo") continue;
      const photos = photosOf(data[field.id]);
      if (photos.length === 0) continue;
      items.push({
        submissionId: s.id,
        reportType: s.reportType,
        reportTitle: report.title,
        createdAt: s.createdAt.toISOString(),
        operator: s.operator,
        fieldLabel: field.label,
        photos,
      });
    }
  }

  return NextResponse.json({ items });
}
