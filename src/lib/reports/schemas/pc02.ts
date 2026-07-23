import { ReportDef } from "../types";
import { LIST, TANQUES_ALMACENAMIENTO } from "../options";
import { numOrNull } from "../util";

const CONC_MIN = 31.8;
const CONC_MAX = 33.2;

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
        { id: "ph", label: "pH", type: "number", required: true },
        { id: "phCumple", label: "¿El pH cumple especificación?", type: "boolean", required: true },
        { id: "pesoEspecifico", label: "Peso específico (densidad)", type: "number", required: true },
        { id: "pesoEspecificoCumple", label: "¿El peso específico cumple especificación?", type: "boolean", required: true },
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
        { id: "observaciones", label: "Observaciones", type: "textarea" },
      ],
    },
  ],
};
