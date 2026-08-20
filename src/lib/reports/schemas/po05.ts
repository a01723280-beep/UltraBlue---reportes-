import { ReportDef } from "../types";
import { LIST, ESTADO_4, TANQUES_ALMACENAMIENTO } from "../options";

export const po05: ReportDef = {
  code: "PO-05",
  title: "Reporte de envasado de tote (IBC)",
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
      id: "inspeccion-ibc",
      title: "Inspección del IBC",
      fields: [
        { id: "limpioExterno", label: "¿El IBC está limpio externamente?", type: "boolean", required: true },
        { id: "limpioInterno", label: "¿El IBC está limpio internamente?", type: "boolean", required: true },
        { id: "estadoGeneral", label: "Estado general del IBC", type: "select", options: ESTADO_4, required: true },
        { id: "presentaDanos", label: "¿El IBC presenta daños?", type: "boolean", required: true },
        {
          id: "tipoDano",
          label: "Tipo de daño",
          type: "select",
          options: ["Golpe", "Grieta", "Jaula dañada", "Válvula dañada", "Otro"].map((v) => ({ value: v, label: v })),
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
        { id: "valvulaFunciona", label: "¿La válvula funciona correctamente?", type: "boolean", required: true },
        { id: "tapaBuenEstado", label: "¿La tapa está en buen estado?", type: "boolean", required: true },
      ],
    },
    {
      id: "sellado",
      title: "Sellado",
      fields: [
        { id: "numeroSello", label: "Número de sello 1", type: "text", required: true },
        { id: "numeroSello2", label: "Número de sello 2", type: "text", required: true },
        { id: "selloColocadoBien", label: "¿Se colocaron correctamente ambos sellos?", type: "boolean", required: true },
      ],
    },
    {
      id: "cliente",
      title: "Cliente",
      fields: [
        { id: "cliente", label: "Cliente", type: "master-select", listKey: LIST.clientes, required: true },
        { id: "ordenVenta", label: "Orden de venta", type: "master-select", listKey: LIST.ordenesVenta, required: true },
      ],
    },
    {
      id: "llenado",
      title: "Llenado",
      fields: [
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
        { id: "anomalia", label: "¿Se presentó alguna anomalía durante el llenado?", type: "boolean", required: true },
        {
          id: "tipoAnomalia",
          label: "Tipo de anomalía",
          type: "select",
          options: ["Derrame", "Problema en bomba", "Problema en válvula", "IBC dañado", "Fuga", "Otro"].map((v) => ({ value: v, label: v })),
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
