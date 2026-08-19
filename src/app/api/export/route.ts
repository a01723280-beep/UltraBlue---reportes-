import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { isPlantSlug, getPlant } from "@/lib/plants";
import { getReportDef, allFieldsOf } from "@/lib/reports/schemas";
import { FormValues } from "@/lib/reports/types";

interface StoredPhoto {
  name: string;
  dataUrl: string;
}

// Cada foto se incrusta como una miniatura de este alto; el ancho se deriva
// para no deformarla. Las filas con foto crecen para dejarle lugar.
const PHOTO_ROW_HEIGHT = 90;
const PHOTO_CELL_WIDTH = 120;

function photosOf(raw: unknown): StoredPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is StoredPhoto =>
      typeof p?.dataUrl === "string" && p.dataUrl.startsWith("data:image/")
  );
}

// Ninguna celda se queda en blanco: una casilla vacía no distingue "no se
// contestó" de "se perdió el dato", y al filtrar en Excel los huecos se
// comportan distinto que un valor.
const SIN_DATO = "Ninguno";

function formatCell(type: string, raw: unknown): string | number | Date | null {
  const vacio = raw === null || raw === undefined || raw === "";

  switch (type) {
    case "photo":
      // La imagen se incrusta aparte; el texto lo pone quien arma la fila.
      return null;
    case "number":
      if (vacio) return 0;
      return typeof raw === "number" ? raw : Number(raw);
    case "calculated":
      // `calculate` devuelve número o texto según el campo, así que se
      // respeta el tipo que llegó.
      if (vacio) return SIN_DATO;
      return typeof raw === "number" ? raw : String(raw);
    case "boolean":
      // Un Sí/No sin responder no se convierte en "No": eso inventaría una
      // respuesta que el operador nunca dio.
      return raw === true ? "Sí" : raw === false ? "No" : SIN_DATO;
    case "signature":
      return raw ? "Firmado" : SIN_DATO;
    default:
      return vacio ? SIN_DATO : String(raw);
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
  const photoFields = fields.filter((f) => f.type === "photo");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UltraBlue";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(report.code);

  sheet.columns = [
    { header: "Folio interno", key: "_id", width: 24 },
    { header: "Fecha de registro", key: "_createdAt", width: 20 },
    { header: "Operador", key: "_operator", width: 22 },
    ...fields.map((f) => ({
      header: f.label,
      key: f.id,
      width: f.type === "photo" ? PHOTO_CELL_WIDTH / 7 : 26,
    })),
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCEEFB" } };

  for (const s of submissions) {
    const data = (s.data ?? {}) as FormValues;
    const row: Record<string, unknown> = {
      _id: s.id,
      _createdAt: s.createdAt.toISOString().replace("T", " ").slice(0, 19),
      _operator: s.operator ?? SIN_DATO,
    };
    for (const f of fields) {
      row[f.id] = formatCell(f.type, data[f.id]);
    }
    const added = sheet.addRow(row);

    // Excel ancla las imágenes a coordenadas, no a celdas, así que hay que
    // colocarlas después de conocer el número de fila.
    let rowHasPhoto = false;
    for (const f of photoFields) {
      const photos = photosOf(data[f.id]);
      if (photos.length === 0) {
        added.getCell(f.id).value = SIN_DATO;
        continue;
      }
      rowHasPhoto = true;
      const col = sheet.getColumn(f.id).number;
      photos.forEach((photo, i) => {
        const [meta, base64] = photo.dataUrl.split(",");
        if (!base64) return;
        const extension = meta.includes("png") ? "png" : "jpeg";
        const imageId = workbook.addImage({ base64, extension });
        sheet.addImage(imageId, {
          // Varias fotos del mismo campo se reparten a lo ancho de la celda.
          tl: { col: col - 1 + i * 0.5, row: added.number - 1 } as ExcelJS.Anchor,
          ext: { width: PHOTO_CELL_WIDTH, height: PHOTO_ROW_HEIGHT },
        });
      });
    }
    if (rowHasPhoto) added.height = PHOTO_ROW_HEIGHT * 0.78;
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
