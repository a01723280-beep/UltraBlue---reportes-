import { ReportDef } from "../types";
import { LIST, ESTADO_4 } from "../options";

export const po08: ReportDef = {
  code: "PO-08",
  title: "Reporte de limpieza de mixer",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        { id: "operador", label: "Operador responsable", type: "master-select", listKey: LIST.operadores, required: true },
      ],
    },
    {
      id: "actividades-diarias",
      title: "Actividades diarias",
      fields: [
        { id: "filtroYLimpio", label: '¿Se limpió el filtro "Y"?', type: "boolean", required: true },
        { id: "mezcladorLibreResiduos", label: "¿El mezclador quedó libre de residuos?", type: "boolean", required: true },
        { id: "fugasDetectadas", label: "¿Se detectaron fugas en el sistema?", type: "boolean", required: true },
        {
          id: "dondeFuga",
          label: "¿Dónde se encontró la fuga?",
          type: "select",
          options: ["Mixer", "Bomba", "Tubería", "Válvula", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.fugasDetectadas === true,
          required: true,
        },
        {
          id: "dondeFugaOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.dondeFuga === "Otro",
          required: true,
        },
        { id: "fibrasEliminadas", label: "¿Se eliminaron fibras del tanque de urea?", type: "boolean", required: true },
        { id: "limpiezaTolvaMixer", label: "¿Se realizó la limpieza de la tolva y del mixer?", type: "boolean", required: true },
      ],
    },
    {
      id: "actividades-semanales",
      title: "Actividades semanales",
      fields: [
        { id: "limpiezaGeneralMaquina", label: "¿Se realizó la limpieza general de la máquina?", type: "boolean", required: true },
        { id: "serpentinLimpio", label: "¿Se limpió el serpentín interior?", type: "boolean", required: true },
      ],
    },
    {
      id: "actividades-mensuales",
      title: "Actividades mensuales",
      fields: [
        { id: "conveyorLimpio", label: "¿Se limpió el conveyor?", type: "boolean", required: true },
        { id: "tornillosInspeccionados", label: "¿Se inspeccionaron tornillos y abrazaderas?", type: "boolean", required: true },
      ],
    },
    {
      id: "condicion-equipo",
      title: "Condición del equipo",
      fields: [
        { id: "estadoGeneralMixer", label: "Estado general del mixer", type: "select", options: ESTADO_4, required: true },
        { id: "anomaliaDetectada", label: "¿Se detectó alguna anomalía?", type: "boolean", required: true },
        {
          id: "tipoAnomalia",
          label: "Tipo de anomalía",
          type: "select",
          options: ["Vibración", "Ruido", "Fuga", "Desgaste", "Tornillo flojo", "Corrosión", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.anomaliaDetectada === true,
          required: true,
        },
        {
          id: "tipoAnomaliaOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.tipoAnomalia === "Otro",
          required: true,
        },
      ],
    },
    {
      id: "acciones-correctivas",
      title: "Acciones correctivas",
      fields: [
        { id: "mantenimientoNecesario", label: "¿Fue necesario realizar mantenimiento?", type: "boolean", required: true },
        {
          id: "tipoMantenimiento",
          label: "Tipo de mantenimiento",
          type: "select",
          options: ["Correctivo", "Preventivo", "Urgente"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.mantenimientoNecesario === true,
          required: true,
        },
        { id: "reportadoMantenimiento", label: "¿Se reportó al área de mantenimiento?", type: "boolean", required: true },
        { id: "comentarios", label: "Comentarios", type: "textarea" },
      ],
    },
  ],
};
