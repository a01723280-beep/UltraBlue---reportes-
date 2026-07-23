import { PrismaClient } from "@prisma/client";
import { LIST } from "../src/lib/reports/options";
import { PLANTS } from "../src/lib/plants";

const prisma = new PrismaClient();

// Starting values per list. Operators can add more from any dropdown in the
// app ("+ Otro") — this seed just avoids empty dropdowns on day one.
const BASE_DATA: Record<string, string[]> = {
  [LIST.operadores]: ["Jahaziel Escobedo", "Neder Escobedo", "Francisco Oyervides", "Martín Gonzalez", "Santiago Cerda"],
  [LIST.inspectoresCalidad]: ["Jahaziel Escobedo", "Neder Escobedo", "Francisco Oyervides", "Martín Gonzalez", "Santiago Cerda"],
  [LIST.proveedoresUrea]: ["Femssa", "Santzer"],
  [LIST.contenedores]: ["Contenedor 1", "Contenedor 2"],
  [LIST.ordenesCompra]: [],
  [LIST.tanquesMezclado]: ["Mixer 1", "Mixer 2"],
  [LIST.tanquesAguaCruda]: ["Tanque Agua Cruda 1", "Tanque Agua Cruda 2", "Tanque Agua Cruda 3"],
  [LIST.lotesUreaMateriaPrima]: [],
  [LIST.lotesProduccion]: [],
  [LIST.transportistas]: [],
  [LIST.operadoresTransporte]: [],
  [LIST.clientes]: [],
  [LIST.ordenesVenta]: [],
  [LIST.laboratorios]: ["Laboratorio interno UltraBlue"],
  [LIST.responsablesLaboratorio]: ["Jahaziel Escobedo", "Neder Escobedo", "Francisco Oyervides", "Martín Gonzalez", "Santiago Cerda"],
  [LIST.lugaresEnvio]: [],
};

async function main() {
  for (const plant of PLANTS) {
    for (const [listKey, labels] of Object.entries(BASE_DATA)) {
      for (const label of labels) {
        await prisma.masterListItem.upsert({
          where: { plantId_listKey_label: { plantId: plant.slug, listKey, label } },
          update: {},
          create: { plantId: plant.slug, listKey, label },
        });
      }
    }
  }
  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
