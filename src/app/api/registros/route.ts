import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlantSlug } from "@/lib/plants";
import { getReportDef } from "@/lib/reports/schemas";
import { FormValues } from "@/lib/reports/types";

export interface RegistroResumen {
  id: string;
  reportType: string;
  reportTitle: string;
  createdAt: string;
  operator: string | null;
  /** Lote al que pertenece, si el reporte maneja uno. */
  lote: string | null;
  fotos: number;
}

const CAMPOS_LOTE = [
  "loteProduccion",
  "loteDef",
  "numeroLoteProduccion",
  "numeroLote",
  "numeroLoteProveedor",
  "loteUrea",
];

export async function GET(req: NextRequest) {
  const plant = req.nextUrl.searchParams.get("plant");
  const reportType = req.nextUrl.searchParams.get("reportType");

  if (!plant || !isPlantSlug(plant)) {
    return NextResponse.json({ error: "Planta inválida." }, { status: 400 });
  }

  const submissions = await prisma.reportSubmission.findMany({
    where: { plantId: plant, ...(reportType ? { reportType } : {}) },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const registros: RegistroResumen[] = submissions.map((s) => {
    const data = (s.data ?? {}) as FormValues;
    const lote = CAMPOS_LOTE.map((c) => data[c]).find(
      (v): v is string => typeof v === "string" && v !== ""
    );
    const fotos = Object.values(data).reduce<number>(
      (n, v) =>
        n +
        (Array.isArray(v) && v.some((p) => typeof p?.dataUrl === "string") ? v.length : 0),
      0
    );
    return {
      id: s.id,
      reportType: s.reportType,
      reportTitle: getReportDef(s.reportType)?.title ?? s.reportType,
      createdAt: s.createdAt.toISOString(),
      operator: s.operator,
      lote: lote ?? null,
      fotos,
    };
  });

  return NextResponse.json({ registros });
}

export async function DELETE(req: NextRequest) {
  const { plant, ids } = (await req.json()) as { plant?: string; ids?: string[] };

  if (!plant || !isPlantSlug(plant)) {
    return NextResponse.json({ error: "Planta inválida." }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No se indicó qué borrar." }, { status: 400 });
  }

  // El filtro por planta va aquí y no solo en el cliente: sin él, un id de
  // otra planta bastaría para borrar registros que esa pantalla no mostraba.
  const { count } = await prisma.reportSubmission.deleteMany({
    where: { plantId: plant, id: { in: ids } },
  });

  return NextResponse.json({ borrados: count });
}
