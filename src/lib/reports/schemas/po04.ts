import { ReportDef } from "../types";
import { LIST, TANQUES_ALMACENAMIENTO } from "../options";

export const po04: ReportDef = {
  code: "PO-04",
  title: "Reporte de proceso de llenado de pipa",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        { id: "operadorCarga", label: "Operador de carga", type: "master-select", listKey: LIST.operadores, required: true },
        { id: "loteDef", label: "Lote de DEF", type: "master-select", listKey: LIST.lotesProduccion, required: true },
        { id: "tanqueAlmacenamiento", label: "Tanque de almacenamiento", type: "select", options: TANQUES_ALMACENAMIENTO, required: true },
      ],
    },
    {
      id: "inspeccion-previa",
      title: "Inspección previa",
      fields: [
        { id: "certificadoVigente", label: "¿El certificado del tanque está vigente?", type: "boolean", required: true },
        { id: "estadoTanquePipa", label: "Estado del tanque de la pipa", type: "select", options: [
          { value: "Excelente", label: "Excelente" },
          { value: "Bueno", label: "Bueno" },
          { value: "Regular", label: "Regular" },
          { value: "Malo", label: "Malo" },
        ], required: true },
        { id: "estadoManguera", label: "Estado de la manguera", type: "select", options: [
          { value: "Excelente", label: "Excelente" },
          { value: "Bueno", label: "Bueno" },
          { value: "Regular", label: "Regular" },
          { value: "Malo", label: "Malo" },
        ], required: true },
        { id: "unidadLimpia", label: "¿La unidad está limpia?", type: "boolean", required: true },
        { id: "contaminacion", label: "¿Se detectó contaminación o residuos?", type: "boolean", required: true },
        {
          id: "queSeEncontro",
          label: "¿Qué se encontró?",
          type: "select",
          options: ["Agua", "Aceite", "Polvo", "Producto anterior", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.contaminacion === true,
          required: true,
        },
        {
          id: "queSeEncontroOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.queSeEncontro === "Otro",
          required: true,
        },
      ],
    },
    {
      id: "transporte",
      title: "Información del transporte",
      fields: [
        { id: "numeroEconomico", label: "Número de unidad", type: "text", required: true },
        { id: "placas", label: "Placas", type: "text", required: true },
        { id: "transportista", label: "Transportista", type: "master-select", listKey: LIST.transportistas, required: true },
        { id: "operadorTransporte", label: "Operador del transporte", type: "master-select", listKey: LIST.operadoresTransporte, required: true },
      ],
    },
    {
      id: "carga",
      title: "Carga",
      fields: [
        { id: "inicioCorrecto", label: "¿Se inició correctamente la carga?", type: "boolean", required: true },
        {
          id: "motivoNoInicio",
          label: "Motivo",
          type: "select",
          options: ["Falla de bomba", "Falla de manguera", "Falla de válvula", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.inicioCorrecto === false,
          required: true,
        },
        {
          id: "motivoNoInicioOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.motivoNoInicio === "Otro",
          required: true,
        },
        { id: "litrosCargados", label: "Litros cargados", type: "number", unit: "L", min: 0, required: true },
        { id: "coincideOrden", label: "¿La cantidad cargada coincide con la orden?", type: "boolean", required: true },
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
        { id: "anomalia", label: "¿Se presentó alguna anomalía durante la carga?", type: "boolean", required: true },
        {
          id: "tipoAnomalia",
          label: "Tipo de anomalía",
          type: "select",
          options: ["Fuga", "Problema en bomba", "Problema en manguera", "Problema en válvula", "Problema en la pipa", "Otro"].map((v) => ({ value: v, label: v })),
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
