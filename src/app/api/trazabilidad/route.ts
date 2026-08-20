import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPlantSlug } from "@/lib/plants";
import { getReportDef } from "@/lib/reports/schemas";
import { FormValues } from "@/lib/reports/types";

/**
 * Qué campo de cada reporte apunta al lote de producción (el DEF que sale
 * del mezclado) y cuál al lote de urea que entró. El mezclado es el único
 * que aparece en ambos mapas: por eso es la bisagra de la cadena.
 */
const CAMPO_LOTE_PRODUCCION: Record<string, string> = {
  "PO-03": "loteProduccion",
  "PO-04": "loteDef",
  "PO-05": "loteDef",
  "PO-06": "loteDef",
  "PO-07": "loteDef",
  "PC-02": "numeroLoteProduccion",
  "PC-03": "numeroLote",
  "PC-04": "numeroLote",
};

const CAMPO_LOTE_UREA: Record<string, string> = {
  "PO-01": "numeroLoteProveedor",
  "PC-01": "numeroLote",
  "PO-03": "loteUrea",
};

export interface EslabonTraza {
  id: string;
  reportType: string;
  reportTitle: string;
  createdAt: string;
  operator: string | null;
  /** Datos que valen la pena leer de un vistazo en la cadena. */
  resumen: { etiqueta: string; valor: string }[];
}

export interface RespuestaTraza {
  lote: string | null;
  loteUrea: string | null;
  origen: EslabonTraza[];
  produccion: EslabonTraza[];
  calidad: EslabonTraza[];
  envasado: EslabonTraza[];
}

const CAMPOS_RESUMEN = [
  "proveedorUrea",
  "contenedor",
  "fletero",
  "nombreChofer",
  "tanque",
  "tanqueAlmacenamiento",
  "concentracionFinal",
  "concentracionObtenida",
  "cliente",
  "ordenVenta",
  "litrosCargados",
  "numeroTambosLlenados",
  "numeroPorronesLlenados",
  "resultadoLaboratorio",
  "loteLiberado",
  "liberadoEnvasado",
  "motivoNoConformidad",
];

function aEslabon(s: {
  id: string;
  reportType: string;
  createdAt: Date;
  operator: string | null;
  data: unknown;
}): EslabonTraza | null {
  const report = getReportDef(s.reportType);
  if (!report) return null;
  const data = (s.data ?? {}) as FormValues;

  const resumen: { etiqueta: string; valor: string }[] = [];
  for (const section of report.sections) {
    for (const field of section.fields) {
      if (!CAMPOS_RESUMEN.includes(field.id)) continue;
      const raw = data[field.id];
      if (raw === null || raw === undefined || raw === "") continue;
      const valor = raw === true ? "Sí" : raw === false ? "No" : String(raw);
      resumen.push({ etiqueta: field.label, valor });
    }
  }

  return {
    id: s.id,
    reportType: s.reportType,
    reportTitle: report.title,
    createdAt: s.createdAt.toISOString(),
    operator: s.operator,
    resumen,
  };
}

export async function GET(req: NextRequest) {
  const plant = req.nextUrl.searchParams.get("plant");
  const lote = req.nextUrl.searchParams.get("lote")?.trim();

  if (!plant || !isPlantSlug(plant)) {
    return NextResponse.json({ error: "Planta inválida." }, { status: 400 });
  }
  if (!lote) {
    return NextResponse.json({ error: "Falta el lote a rastrear." }, { status: 400 });
  }

  // Traer los reportes de la planta y cruzarlos en memoria: los lotes viven
  // dentro de un JSON, así que no hay índice que aprovechar filtrando en SQL.
  const todos = await prisma.reportSubmission.findMany({
    where: { plantId: plant },
    orderBy: { createdAt: "asc" },
  });

  const valorDe = (s: (typeof todos)[number], mapa: Record<string, string>) => {
    const campo = mapa[s.reportType];
    if (!campo) return null;
    const v = (s.data as FormValues)?.[campo];
    return typeof v === "string" && v !== "" ? v : null;
  };

  // El mezclado que emitió este lote es el que dice qué urea se consumió.
  const mezclado = todos.find(
    (s) => s.reportType === "PO-03" && valorDe(s, CAMPO_LOTE_PRODUCCION) === lote
  );
  const loteUrea = mezclado ? valorDe(mezclado, CAMPO_LOTE_UREA) : null;

  const porLoteProduccion = todos.filter((s) => valorDe(s, CAMPO_LOTE_PRODUCCION) === lote);
  const porLoteUrea = loteUrea
    ? todos.filter((s) => s.reportType !== "PO-03" && valorDe(s, CAMPO_LOTE_UREA) === loteUrea)
    : [];

  const limpiar = (arr: typeof todos) =>
    arr.map(aEslabon).filter((e): e is EslabonTraza => e !== null);

  const respuesta: RespuestaTraza = {
    lote,
    loteUrea,
    origen: limpiar(porLoteUrea),
    produccion: limpiar(porLoteProduccion.filter((s) => s.reportType === "PO-03")),
    calidad: limpiar(porLoteProduccion.filter((s) => s.reportType.startsWith("PC-"))),
    envasado: limpiar(
      porLoteProduccion.filter((s) => ["PO-04", "PO-05", "PO-06", "PO-07"].includes(s.reportType))
    ),
  };

  return NextResponse.json(respuesta);
}
