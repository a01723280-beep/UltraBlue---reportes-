import { ReportDef } from "../types";
import { LIST, ESTADO_4, TANQUES_ALMACENAMIENTO } from "../options";

const VOLUMEN_PORRON = 20;

export const po09: ReportDef = {
  code: "PO-09",
  title: "Reporte llenado de porrón",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        { id: "operador", label: "Operador responsable", type: "master-select", listKey: LIST.operadores, required: true },
        { id: "loteDef", label: "Lote de DEF", type: "master-select", listKey: LIST.lotesProduccion, required: true },
        { id: "tanqueAlmacenamiento", label: "Tanque de almacenamiento", type: "select", options: TANQUES_ALMACENAMIENTO, required: true },
      ],
    },
    {
      id: "inspeccion-porron",
      title: "Inspección del porrón",
      fields: [
        { id: "limpioExterno", label: "¿El porrón está limpio externamente?", type: "boolean", required: true },
        { id: "limpioInterno", label: "¿El porrón está limpio internamente?", type: "boolean", required: true },
        { id: "estadoGeneral", label: "Estado general del porrón", type: "select", options: ESTADO_4, required: true },
        { id: "presentaDanos", label: "¿El porrón presenta daños?", type: "boolean", required: true },
        {
          id: "tipoDano",
          label: "Tipo de daño",
          type: "select",
          options: ["Grieta", "Golpe", "Deformación", "Rosca dañada", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.presentaDanos === true,
          required: true,
        },
        {
          id: "tipoDanoOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.tipoDano === "Otro",
          required: true,
        },
        { id: "tapaBuenEstado", label: "¿La tapa está en buen estado?", type: "boolean", required: true },
      ],
    },
    {
      id: "llenado",
      title: "Llenado",
      fields: [
        {
          // Los porrones son de 20 L; el dato viene del envase, no se mide.
          id: "volumenPorPorron",
          label: "Volumen por porrón",
          type: "calculated",
          calculate: () => VOLUMEN_PORRON,
        },
        { id: "numeroPorronesLlenados", label: "Número de porrones llenados", type: "number", min: 0, required: true },
        { id: "todosLlenadosBien", label: "¿Todos los porrones fueron llenados correctamente?", type: "boolean", required: true },
        {
          id: "porronesConProblemas",
          label: "¿Cuántos presentaron problemas?",
          type: "number",
          min: 0,
          showIf: (v) => v.todosLlenadosBien === false,
          required: true,
        },
      ],
    },
    {
      id: "muestreo",
      title: "Muestreo",
      fields: [
        { id: "seTomoMuestra", label: "¿Se tomó muestra?", type: "boolean", required: true },
        { id: "numeroMuestra", label: "Número de muestra", type: "auto-number", showIf: (v) => v.seTomoMuestra === true },
      ],
    },
    {
      id: "observaciones",
      title: "Observaciones",
      fields: [
        { id: "anomalia", label: "¿Se presentó alguna anomalía durante el llenado?", type: "boolean", required: true },
        {
          id: "tipoAnomalia",
          label: "Tipo de anomalía",
          type: "select",
          options: ["Derrame", "Fuga", "Problema en bomba", "Problema en manguera", "Porrón dañado", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.anomalia === true,
          required: true,
        },
        {
          id: "tipoAnomaliaOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.tipoAnomalia === "Otro",
          required: true,
        },
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "comentarios", label: "Comentarios", type: "textarea" },
      ],
    },
  ],
};
