import { ReportDef } from "../types";
import { LIST, ESTADO_4, TANQUES_ALMACENAMIENTO } from "../options";

const VOLUMEN_TAMBO = 200;

export const po06: ReportDef = {
  code: "PO-06",
  title: "Reporte de envasado de tambo",
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
      id: "inspeccion-tambo",
      title: "Inspección del tambo",
      fields: [
        { id: "limpioExterno", label: "¿El tambo está limpio externamente?", type: "boolean", required: true },
        { id: "limpioInterno", label: "¿El tambo está limpio internamente?", type: "boolean", required: true },
        { id: "estadoGeneral", label: "Estado general del tambo", type: "select", options: ESTADO_4, required: true },
        { id: "presentaDanos", label: "¿El tambo presenta daños?", type: "boolean", required: true },
        {
          id: "tipoDano",
          label: "Tipo de daño",
          type: "select",
          options: ["Golpe", "Abolladura", "Óxido", "Fuga", "Otro"].map((v) => ({ value: v, label: v })),
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
      id: "sellado",
      title: "Sellado",
      fields: [
        { id: "numeroSello", label: "Sello", type: "text", required: true },
        { id: "selloColocadoBien", label: "¿El sello fue colocado correctamente?", type: "boolean", required: true },
      ],
    },
    {
      id: "llenado",
      title: "Llenado",
      fields: [
        {
          // Todos los tambos son de 200 L: es un dato del envase, no una
          // medición, así que se muestra fijo en vez de pedirlo cada vez.
          id: "volumenPorTambo",
          label: "Volumen por tambo",
          type: "calculated",
          calculate: () => VOLUMEN_TAMBO,
        },
        { id: "numeroTambosLlenados", label: "Número de tambos llenados", type: "number", min: 0, required: true },
        { id: "todosLlenadosBien", label: "¿Todos los tambos fueron llenados correctamente?", type: "boolean", required: true },
        {
          id: "tambosConProblemas",
          label: "¿Cuántos tambos presentaron problemas?",
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
          options: ["Derrame", "Fuga", "Problema en bomba", "Problema en manguera", "Tambo dañado", "Otro"].map((v) => ({ value: v, label: v })),
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
