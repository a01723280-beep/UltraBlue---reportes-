import { FieldOption } from "./types";

export const ESTADO_4: FieldOption[] = [
  { value: "Excelente", label: "Excelente" },
  { value: "Bueno", label: "Bueno" },
  { value: "Regular", label: "Regular" },
  { value: "Malo", label: "Malo" },
];

// Las bolsas de urea no se califican en una escala de calidad como el resto
// del equipo: al recibirlas solo se distingue si llegaron bien, con desgaste
// normal, o dañadas.
export const ESTADO_BOLSAS: FieldOption[] = [
  { value: "Buena", label: "Buena" },
  { value: "Normal", label: "Normal" },
  { value: "Dañada", label: "Dañada" },
];

// El agua recorre tres etapas y cada una tiene sus propios tanques:
//
//   TAC1-3  agua cruda        -> ósmosis ->  T1-T2  agua desionizada
//   T1-T2   + urea            -> mezclado ->  TDEF-1..4  producto terminado
//
// Se listan con la nomenclatura que llevan rotulada en planta, para que el
// operador elija leyendo la etiqueta y no traduciendo.

/** Los mezcladores de la planta, con el nombre que se les da en piso. */
export const TANQUES_MEZCLADO: FieldOption[] = [
  { value: "Rusia tanque 1", label: "Rusia tanque 1" },
  { value: "Brasil tanque 1", label: "Brasil tanque 1" },
  { value: "Brasil tanque 2", label: "Brasil tanque 2" },
];

export const TANQUES_AGUA_CRUDA: FieldOption[] = [
  { value: "TAC1", label: "TAC1" },
  { value: "TAC2", label: "TAC2" },
  { value: "TAC3", label: "TAC3" },
];

export const TANQUES_AGUA_DESIONIZADA: FieldOption[] = [
  { value: "T1", label: "T1" },
  { value: "T2", label: "T2" },
];

/** Producto terminado (DEF). */
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
  fleteros: "fleteros",
  choferes: "choferes",
  ordenesCompra: "ordenes_compra",
  tanquesMezclado: "tanques_mezclado",
  lotesUreaMateriaPrima: "lotes_urea_materia_prima",
  lotesProduccion: "lotes_produccion",
  transportistas: "transportistas",
  operadoresTransporte: "operadores_transporte",
  clientes: "clientes",
  ordenesVenta: "ordenes_venta",
  laboratorios: "laboratorios",
  responsablesLaboratorio: "responsables_laboratorio",
  lugaresEnvio: "lugares_envio",
  instructores: "instructores",
} as const;

// Fixed equipment catalog for PC-05 (calibración). Unlike the master lists
// these are physical instruments with fixed plate data, so selecting one
// auto-fills its función / marca / serie / código instead of being typed.
export interface EquipoCalibracion {
  funcion: string;
  marca: string;
  serie: string;
  codigo: string;
}

export const EQUIPOS_CALIBRACION: Record<string, EquipoCalibracion> = {
  "Termohigrómetro": {
    funcion: "Medidor de temperatura y humedad",
    marca: "Huato",
    serie: "H23AIG064",
    codigo: "UDM-001",
  },
  "Copa de Densidad": {
    funcion: "Medición de peso específico",
    marca: "Modern Instruments",
    serie: "NA",
    codigo: "UDM-002",
  },
  "Medidor PH": {
    funcion: "Medir PH en solución líquida",
    marca: "Atago",
    serie: "5028227",
    codigo: "UDM-003",
  },
  "Refractómetro": {
    funcion: "Medir concentración de urea",
    marca: "Atago",
    serie: "SA914820",
    codigo: "UDM-004",
  },
  "Báscula": {
    funcion: "Medir peso en gramos",
    marca: "Rhino",
    serie: "BAORE3-01979-0025",
    codigo: "UDM-005",
  },
};

export const EQUIPOS_CALIBRACION_OPTIONS: FieldOption[] = Object.keys(EQUIPOS_CALIBRACION).map((k) => ({
  value: k,
  label: k,
}));
