import { ReportDef } from "../types";
import { LIST, TANQUES_ALMACENAMIENTO } from "../options";

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
      id: "sellado",
      title: "Sellado",
      fields: [
        { id: "numeroSello1", label: "Número de sello 1", type: "text" },
        { id: "numeroSello2", label: "Número de sello 2", type: "text" },
        { id: "numeroSello3", label: "Número de sello 3", type: "text" },
        { id: "numeroSello4", label: "Número de sello 4", type: "text" },
        { id: "numeroSello5", label: "Número de sello 5", type: "text" },
        { id: "numeroSello6", label: "Número de sello 6", type: "text" },
        { id: "selloColocadoBien", label: "¿Los sellos quedaron correctamente colocados?", type: "boolean", required: true },
      ],
    },
    {
      // Un mismo envasado puede repartirse entre varios clientes, cada uno
      // con su cantidad y su orden de venta: se captura como lista para no
      // obligar a llenar un reporte por destino.
      id: "clientes",
      title: "Clientes",
      repetible: { agregar: "Agregar cliente", singular: "Cliente", minimo: 1 },
      fields: [
        { id: "cliente", label: "Cliente", type: "master-select", listKey: LIST.clientes, required: true },
        { id: "totesEntregados", label: "Totes entregados", type: "number", min: 0, required: true },
        { id: "ordenVenta", label: "Orden de venta", type: "master-select", listKey: LIST.ordenesVenta, required: true },
      ],
    },
    {
      id: "llenado",
      title: "Llenado",
      fields: [
        {
          // El mismo tote sirve para DEF o para agua, y viene en dos
          // capacidades: ambas cosas cambian qué se despachó, así que se
          // registran en vez de asumirse.
          id: "contenido",
          label: "Contenido",
          type: "select",
          options: [
            { value: "DEF (urea)", label: "DEF (urea)" },
            { value: "Agua", label: "Agua" },
          ],
          required: true,
        },
        {
          id: "volumenPorTote",
          label: "Volumen por tote",
          type: "select",
          options: [
            { value: "1000", label: "1000 L" },
            { value: "1200", label: "1200 L" },
          ],
          required: true,
        },
        { id: "numeroTotesLlenados", label: "Número de totes llenados", type: "number", min: 0, required: true },
        { id: "todosLlenadosBien", label: "¿Todos los totes fueron llenados correctamente?", type: "boolean", required: true },
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
