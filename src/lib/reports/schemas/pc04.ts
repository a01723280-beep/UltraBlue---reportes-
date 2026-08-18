import { ReportDef } from "../types";
import { LIST, TANQUES_ALMACENAMIENTO } from "../options";

export const pc04: ReportDef = {
  code: "PC-04",
  title: "Reporte de producto no conforme",
  category: "calidad",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        { id: "inspector", label: "Inspector de calidad", type: "master-select", listKey: LIST.inspectoresCalidad, required: true },
      ],
    },
    {
      id: "identificacion",
      title: "Identificación",
      fields: [
        { id: "numeroLote", label: "Número de lote", type: "master-select", listKey: LIST.lotesProduccion, required: true },
        { id: "tanque", label: "Tanque", type: "select", options: TANQUES_ALMACENAMIENTO, required: true },
        { id: "etiquetaPnc", label: "¿El tanque fue identificado con etiqueta de PNC?", type: "boolean", required: true },
        { id: "numeroEtiquetaPnc", label: "Número de etiqueta PNC", type: "text", showIf: (v) => v.etiquetaPnc === true },
      ],
    },
    {
      id: "deteccion",
      title: "Detección",
      fields: [
        {
          id: "comoDetectado",
          label: "¿Cómo se detectó la no conformidad?",
          type: "select",
          options: ["Laboratorio", "Inspección visual", "Auditoría", "Reclamo de cliente", "Producción", "Otro"].map((v) => ({ value: v, label: v })),
          required: true,
        },
        {
          id: "motivoNoConformidad",
          label: "Motivo de la no conformidad",
          type: "select",
          options: [
            "Concentración fuera de especificación",
            "pH fuera de especificación",
            "Peso específico fuera de especificación",
            "Contaminación",
            "Error de producción",
            "Error de envasado",
            "Otro",
          ].map((v) => ({ value: v, label: v })),
          required: true,
        },
      ],
    },
    {
      id: "accion",
      title: "Acción tomada",
      fields: [
        {
          id: "queSeHizo",
          label: "¿Qué se hizo con el producto?",
          type: "select",
          options: ["Retrabajo", "Reproceso", "Cuarentena", "Desecho", "Liberación excepcional"].map((v) => ({ value: v, label: v })),
          required: true,
        },
      ],
    },
    {
      id: "seguimiento",
      title: "Seguimiento",
      fields: [
        { id: "tanqueLimpiado", label: "¿Se limpió el tanque después del PNC?", type: "boolean", required: true },
        { id: "fechaLimpieza", label: "Fecha de limpieza", type: "date", showIf: (v) => v.tanqueLimpiado === true },
        { id: "responsableLimpieza", label: "Responsable de la limpieza", type: "master-select", listKey: LIST.operadores, showIf: (v) => v.tanqueLimpiado === true },
      ],
    },
    {
      id: "destino",
      title: "Destino",
      fields: [
        {
          id: "destinoFinal",
          label: "Destino final del producto",
          type: "select",
          options: ["Reproceso", "Desecho", "Cliente", "Almacén", "Otro"].map((v) => ({ value: v, label: v })),
          required: true,
        },
        { id: "fechaEmpaque", label: "Fecha de empaque", type: "date" },
        { id: "fechaEnvio", label: "Fecha de envío", type: "date" },
        { id: "lugarEnvio", label: "Lugar de envío", type: "master-select", listKey: LIST.lugaresEnvio },
      ],
    },
    {
      id: "cierre",
      title: "Cierre",
      fields: [
        { id: "ncCerrada", label: "¿Se cerró la no conformidad?", type: "boolean", required: true },
        { id: "numeroAccionCorrectiva", label: "Número de Acción Correctiva (si aplica)", type: "text" },
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "observaciones", label: "Observaciones", type: "textarea" },
      ],
    },
  ],
};
