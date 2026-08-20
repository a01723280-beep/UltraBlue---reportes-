import { ReportDef } from "../types";
import { LIST, TANQUES_ALMACENAMIENTO } from "../options";
import { numOrNull } from "../util";

const CONC_MIN = 31.8;
const CONC_MAX = 33.2;
// Especificaciones ISO 22241 para el producto terminado. El sistema compara
// contra ellas en vez de preguntarle al operador si el valor cumple: el dato
// medido ya contiene la respuesta, y preguntarla abre la puerta a que se
// conteste "sí" sobre una lectura fuera de rango.
const PH_MIN = 9;
const PH_MAX = 10;
const DENSIDAD_MIN = 1.3814;
const DENSIDAD_MAX = 1.3843;

export const pc02: ReportDef = {
  code: "PC-02",
  title: "Reporte de aceptación del lote",
  category: "calidad",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "inspector", label: "Inspector de calidad", type: "master-select", listKey: LIST.inspectoresCalidad, required: true },
        { id: "numeroLoteProduccion", label: "Número de lote de producción", type: "master-select", listKey: LIST.lotesProduccion, required: true },
        { id: "tanque", label: "Tanque", type: "select", options: TANQUES_ALMACENAMIENTO, required: true },
      ],
    },
    {
      id: "analisis",
      title: "Análisis del producto",
      fields: [
        { id: "concentracionUrea", label: "Concentración de urea", type: "number", unit: "%", required: true },
        { id: "concentracionRefractometro", label: "Concentración medida con refractómetro", type: "number", unit: "%", required: true },
        {
          id: "concentracionCumple",
          label: `¿La concentración cumple especificación (${CONC_MIN}–${CONC_MAX} %, ISO 22241)?`,
          type: "calculated",
          calculate: (v) => {
            const c = numOrNull(v.concentracionRefractometro);
            if (c === null) return null;
            return c >= CONC_MIN && c <= CONC_MAX ? "Sí" : "No";
          },
          alertIf: (v) => {
            const c = numOrNull(v.concentracionRefractometro);
            if (c === null) return null;
            return c >= CONC_MIN && c <= CONC_MAX ? null : "⚠️ Concentración fuera de especificación ISO 22241.";
          },
        },
        {
          id: "ph",
          label: `pH (especificación ${PH_MIN}–${PH_MAX})`,
          type: "number",
          step: 0.01,
          required: true,
          alertIf: (v) => {
            const x = numOrNull(v.ph);
            if (x === null) return null;
            return x < PH_MIN || x > PH_MAX
              ? `⚠️ pH fuera de especificación (${PH_MIN}–${PH_MAX}).`
              : null;
          },
        },
        {
          id: "pesoEspecifico",
          label: `Peso específico (especificación ${DENSIDAD_MIN}–${DENSIDAD_MAX})`,
          type: "number",
          step: 0.0001,
          required: true,
          alertIf: (v) => {
            const x = numOrNull(v.pesoEspecifico);
            if (x === null) return null;
            return x < DENSIDAD_MIN || x > DENSIDAD_MAX
              ? `⚠️ Peso específico fuera de especificación (${DENSIDAD_MIN}–${DENSIDAD_MAX}).`
              : null;
          },
        },
      ],
    },
    {
      id: "muestreo",
      title: "Muestreo",
      fields: [
        { id: "muestraPlanta", label: "¿Se tomó muestra en planta?", type: "boolean", required: true },
        { id: "numeroMuestraPlanta", label: "Número de muestra de planta", type: "auto-number", showIf: (v) => v.muestraPlanta === true },
        { id: "muestraLaboratorio", label: "¿Se envió muestra al laboratorio?", type: "boolean", required: true },
        { id: "numeroMuestraLaboratorio", label: "Número de muestra de laboratorio", type: "auto-number", showIf: (v) => v.muestraLaboratorio === true },
      ],
    },
    {
      id: "resultado",
      title: "Resultado de calidad",
      fields: [
        {
          id: "resultadoLaboratorio",
          label: "Resultado del laboratorio",
          type: "select",
          options: [
            { value: "Aprobado", label: "Aprobado" },
            { value: "Rechazado", label: "Rechazado" },
            { value: "Pendiente", label: "Pendiente" },
          ],
          required: true,
        },
        {
          id: "motivoRechazo",
          label: "Motivo",
          type: "select",
          options: [
            "Concentración fuera de especificación",
            "pH fuera de especificación",
            "Peso específico fuera de especificación",
            "Contaminación",
            "Otro",
          ].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.resultadoLaboratorio === "Rechazado",
          required: true,
        },
        {
          id: "motivoRechazoOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.motivoRechazo === "Otro",
          required: true,
        },
      ],
    },
    {
      id: "liberacion",
      title: "Liberación",
      fields: [
        {
          id: "liberadoEnvasado",
          label: "¿Se libera el lote para envasado?",
          type: "select",
          options: [
            { value: "Sí", label: "Sí" },
            { value: "No", label: "No" },
            { value: "En espera", label: "En espera" },
          ],
          required: true,
        },
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "observaciones", label: "Observaciones", type: "textarea" },
      ],
    },
  ],
};
