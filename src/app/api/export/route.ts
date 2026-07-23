import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { isPlantSlug, getPlant } from "@/lib/plants";
import { getReportDef, allFieldsOf } from "@/lib/reports/schemas";
import { FormValues } from "@/lib/reports/types";

function formatCell(type: string, raw: unknown): string | number | Date | null {
  if (raw === null || raw === undefined || raw === "") return null;
  switch (type) {
    case "boolean":
      return raw === true ? "Sí" : raw === false ? "No" : null;
    case "number":
    case "calculated":
      return typeof raw === "number" ? raw : String(raw);
    case "signature":
      return raw ? "Firmado" : "No";
    case "photo": {
      const arr = raw as { name: string }[] | undefined;
      return arr && arr.length > 0 ? `${arr.length} foto(s) adjunta(s)` : "Sin fotos";
    }
    default:
      return String(raw);
  }
}

export async function GET(req: NextRequest) {
  const plant = req.nextUrl.searchParams.get("plant");
  const reportType = req.nextUrl.searchParams.get("reportType");

  if (!plant || !isPlantSlug(plant) || !reportType) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }
  const report = getReportDef(reportType);
  if (!report) {
    return NextResponse.json({ error: "Tipo de reporte desconocido." }, { status: 400 });
  }

  const submissions = await prisma.reportSubmission.findMany({
    where: { plantId: plant, reportType },
    orderBy: { createdAt: "asc" },
  });

  const fields = allFieldsOf(report);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UltraBlue";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(report.code);

  sheet.columns = [
    { header: "Folio interno", key: "_id", width: 24 },
    { header: "Fecha de registro", key: "_createdAt", width: 20 },
    { header: "Operador", key: "_operator", width: 22 },
    ...fields.map((f) => ({ header: f.label, key: f.id, width: 26 })),
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCEEFB" } };

  for (const s of submissions) {
    const data = (s.data ?? {}) as FormValues;
    const row: Record<string, unknown> = {
      _id: s.id,
      _createdAt: s.createdAt.toISOString().replace("T", " ").slice(0, 19),
      _operator: s.operator ?? "",
    };
    for (const f of fields) {
      row[f.id] = formatCell(f.type, data[f.id]);
    }
    sheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const plantName = getPlant(plant)?.name ?? plant;
  const filename = `${report.code}_${plantName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
