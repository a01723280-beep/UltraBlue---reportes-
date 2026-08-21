import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LIST } from "@/lib/reports/options";
import { PlantSlug } from "@/lib/plants";

/** El mezclado es el reporte que emite el lote de producción. */
export const MEZCLADO_REPORT = "PO-05";
export const LOTE_PRODUCCION_FIELD = "loteProduccion";

/** Código corto por planta, para que el lote se lea de un vistazo en la
 * etiqueta de un tambo. */
const PLANT_CODE: Record<PlantSlug, string> = {
  cdmx: "CDMX",
  monterrey: "MTY",
  hermosillo: "HMO",
};

/** Cuántos lotes puede emitir una planta en un mismo día antes de que el
 * consecutivo se quede sin espacio. */
const MAX_LOTES_POR_DIA = 99;

function fechaCompacta(now: Date): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Reserva el siguiente lote de producción de la planta, con el formato
 * `DEF-CDMX-260819-01`.
 *
 * El número se asigna insertándolo en la lista maestra de lotes, que tiene
 * un índice único por (planta, lista, valor). Esa restricción es la que
 * decide quién gana si dos operadores guardan un mezclado a la vez: el
 * segundo choca, y aquí se reintenta con el consecutivo siguiente. Contar
 * los reportes del día no serviría, porque dos lecturas simultáneas
 * devolverían el mismo número.
 */
export async function reservarLoteProduccion(plant: PlantSlug, now = new Date()): Promise<string> {
  const prefijo = `DEF-${PLANT_CODE[plant]}-${fechaCompacta(now)}`;

  for (let n = 1; n <= MAX_LOTES_POR_DIA; n++) {
    const label = `${prefijo}-${String(n).padStart(2, "0")}`;
    try {
      await prisma.masterListItem.create({
        data: { plantId: plant, listKey: LIST.lotesProduccion, label },
      });
      return label;
    } catch (error) {
      const yaExiste =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!yaExiste) throw error;
      // Ese consecutivo ya estaba tomado: sigue con el siguiente.
    }
  }

  throw new Error(
    `La planta ya emitió ${MAX_LOTES_POR_DIA} lotes hoy; no hay consecutivo disponible.`
  );
}
