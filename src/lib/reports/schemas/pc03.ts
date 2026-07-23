import { ReportDef } from "../types";
import { LIST, TANQUES_ALMACENAMIENTO } from "../options";

const ORIGENES_MUESTRA = [
  "Tanque Agua Cruda 1",
  "Tanque Agua Cruda 2",
  "Tanque Agua Cruda 3",
  "Tanque Agua Desionizada 1",
  "Tanque Agua Desionizada 2",
  "Mixer",
  "Salida Filtro de Bolsa (25 μm)",
  "Salida Microfiltro",
  "TDEF-1",
  "TDEF-2",
  "TDEF-3",
  "TDEF-4",
  "Pipa",
  "Tote",
  "Tambo",
  "Porrón",
].map((v) => ({ value: v, label: v }));

export const pc03: ReportDef = {
  code: "PC-03",
  title: "Reporte de control de muestras",
  category: "calidad",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        { id: "inspector", label: "Inspector de calidad", type: "master-select", listKey: LIST.inspectoresCalidad, required: true },
        { id: "numeroLote", label: "Número de lote", type: "master-select", listKey: LIST.lotesProduccion, required: true },
        { id: "tanque", label: "Tanque", type: "select", options: TANQUES_ALMACENAMIENTO, required: true },
      ],
    },
    {
      id: "muestra",
      title: "Información de la muestra",
      fields: [
        { id: "numeroMuestra", label: "Número de muestra", type: "auto-number" },
        {
          id: "tipoMuestra",
          label: "Tipo de muestra",
          type: "select",
          options: ["Producción", "Materia prima", "Producto terminado", "Retención", "Reclamo de cliente", "Investigación"].map((v) => ({ value: v, label: v })),
          required: true,
        },
        { id: "origenMuestra", label: "Origen de la muestra", type: "select", options: ORIGENES_MUESTRA, required: true },
        { id: "concentracionUrea", label: "Concentración de urea", type: "number", unit: "%", required: true },
      ],
    },
    {
      id: "destino",
      title: "Destino",
      fields: [
        {
          id: "destinoMuestra",
          label: "Destino de la muestra",
          type: "select",
          options: [
            { value: "Laboratorio interno", label: "Laboratorio interno" },
            { value: "Laboratorio externo", label: "Laboratorio externo" },
            { value: "Retención", label: "Retención" },
          ],
          required: true,
        },
        { id: "laboratorio", label: "Laboratorio", type: "master-select", listKey: LIST.laboratorios, showIf: (v) => v.destinoMuestra !== "Retención" },
      ],
    },
    {
      id: "seguimiento",
      title: "Seguimiento",
      fields: [
        { id: "fechaToma", label: "Fecha de toma", type: "date", required: true },
        { id: "fechaEnvio", label: "Fecha de envío", type: "date" },
        { id: "fechaAnalisis", label: "Fecha de análisis", type: "date" },
        { id: "fechaResultado", label: "Fecha de resultado", type: "date" },
      ],
    },
    {
      id: "estado",
      title: "Estado",
      fields: [
        {
          id: "estadoMuestra",
          label: "Estado de la muestra",
          type: "select",
          options: ["Pendiente", "En análisis", "Analizada", "Cerrada", "Rechazada"].map((v) => ({ value: v, label: v })),
          required: true,
        },
      ],
    },
    {
      id: "resultado",
      title: "Resultado",
      fields: [
        {
          id: "resultado",
          label: "Resultado",
          type: "select",
          options: [
            { value: "Conforme", label: "Conforme" },
            { value: "No conforme", label: "No conforme" },
            { value: "Pendiente", label: "Pendiente" },
          ],
          required: true,
        },
        {
          id: "motivoNoConforme",
          label: "Motivo",
          type: "select",
          options: ["Concentración", "pH", "Peso específico", "Contaminación", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.resultado === "No conforme",
          required: true,
        },
        { id: "observaciones", label: "Observaciones", type: "textarea" },
      ],
    },
  ],
};
