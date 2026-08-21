import { ReportDef } from "../types";
import { LIST, ESTADO_4 } from "../options";
import { numOrNull } from "../util";

export const po02: ReportDef = {
  code: "PO-02",
  title: "Reporte de recepción e inspección de totes (IBC)",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        {
          id: "operador",
          label: "Operador responsable",
          type: "master-select",
          listKey: LIST.operadores,
          required: true,
        },
      ],
    },
    {
      id: "documentacion",
      title: "Documentación",
      fields: [
        {
          id: "ordenesCompra",
          label: "Órdenes de compra",
          type: "master-select",
          listKey: LIST.ordenesCompra,
          required: true,
        },
        {
          id: "documentacionCompleta",
          label: "¿La documentación está completa?",
          type: "boolean",
          required: true,
        },
        {
          id: "documentacionFaltante",
          label: "¿Qué documentación falta?",
          type: "textarea",
          showIf: (v) => v.documentacionCompleta === false,
          required: true,
        },
      ],
    },
    {
      id: "cantidades",
      title: "Cantidades",
      fields: [
        { id: "totesOrdenados", label: "Número de totes ordenados", type: "number", required: true },
        { id: "totesRecibidos", label: "Número de totes recibidos", type: "number", required: true },
        {
          id: "diferenciaTotes",
          label: "Diferencia (recibidos − ordenados)",
          type: "calculated",
          calculate: (v) => {
            const ord = numOrNull(v.totesOrdenados);
            const rec = numOrNull(v.totesRecibidos);
            if (ord === null || rec === null) return null;
            return rec - ord;
          },
          alertIf: (v) => {
            const ord = numOrNull(v.totesOrdenados);
            const rec = numOrNull(v.totesRecibidos);
            if (ord === null || rec === null) return null;
            return rec - ord !== 0 ? "⚠️ Hay una diferencia entre lo ordenado y lo recibido." : null;
          },
        },
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
      id: "inspeccion",
      title: "Aceptación",
      fields: [
        { id: "totesRechazados", label: "Número de totes rechazados", type: "number", required: true },
        {
          id: "motivoRechazo",
          label: "Motivo del rechazo",
          type: "textarea",
          showIf: (v) => {
            const n = numOrNull(v.totesRechazados);
            return n !== null && n > 0;
          },
          required: true,
        },
      ],
    },
    {
      id: "evidencia",
      title: "Evidencia y comentarios",
      fields: [
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "comentarios", label: "Comentarios", type: "textarea" },
      ],
    },
  ],
};
