import { FieldOption } from "./types";

export const ESTADO_4: FieldOption[] = [
  { value: "Excelente", label: "Excelente" },
  { value: "Bueno", label: "Bueno" },
  { value: "Regular", label: "Regular" },
  { value: "Malo", label: "Malo" },
];

export const TANQUES_ALMACENAMIENTO: FieldOption[] = [
  { value: "TDEF-1", label: "TDEF-1" },
  { value: "TDEF-2", label: "TDEF-2" },
  { value: "TDEF-3", label: "TDEF-3" },
  { value: "TDEF-4", label: "TDEF-4" },
];

// Master-list keys shared across report schemas. Seeded with sensible
// defaults per plant (see prisma/seed.ts) and always extendable in-app via
// "+ agregar otro" on any master-select field.
export const LIST = {
  operadores: "operadores",
  inspectoresCalidad: "inspectores_calidad",
  proveedoresUrea: "proveedores_urea",
  contenedores: "contenedores",
  ordenesCompra: "ordenes_compra",
  tanquesMezclado: "tanques_mezclado",
  tanquesAguaCruda: "tanques_agua_cruda",
  lotesUreaMateriaPrima: "lotes_urea_materia_prima",
  lotesProduccion: "lotes_produccion",
  transportistas: "transportistas",
  operadoresTransporte: "operadores_transporte",
  clientes: "clientes",
  ordenesVenta: "ordenes_venta",
  laboratorios: "laboratorios",
  responsablesLaboratorio: "responsables_laboratorio",
  lugaresEnvio: "lugares_envio",
} as const;
