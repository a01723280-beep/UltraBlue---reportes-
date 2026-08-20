import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isPlantSlug } from "@/lib/plants";
import { getReportDef } from "@/lib/reports/schemas";
import { LOTE_PRODUCCION_FIELD, MEZCLADO_REPORT, reservarLoteProduccion } from "@/lib/lote";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reportType, plant, operator, data } = body as {
    reportType?: string;
    plant?: string;
    operator?: string | null;
    data?: Record<string, unknown>;
  };

  if (!reportType || !plant || !isPlantSlug(plant) || !data) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }
  if (!getReportDef(reportType)) {
    return NextResponse.json({ error: "Tipo de reporte desconocido." }, { status: 400 });
  }

  // El lote lo asigna el servidor, no el navegador: es el identificador con
  // el que después se rastrea el pedido, así que no puede depender de que dos
  // operadores no coincidan.
  let loteProduccion: string | null = null;
  if (reportType === MEZCLADO_REPORT) {
    loteProduccion = await reservarLoteProduccion(plant);
    data[LOTE_PRODUCCION_FIELD] = loteProduccion;
  }

  const submission = await prisma.reportSubmission.create({
    data: {
      reportType,
      plantId: plant,
      operator: operator ?? null,
      data: data as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ id: submission.id, loteProduccion }, { status: 201 });
}
