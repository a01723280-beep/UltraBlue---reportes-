import { ReportDef } from "../types";
import { LIST, ESTADO_4 } from "../options";
import { numOrNull } from "../util";

export const po04: ReportDef = {
  code: "PO-04",
  title: "Reporte de recepción de porrones",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "hora", label: "Hora", type: "time", required: true },
        { id: "operador", label: "Operador responsable", type: "master-select", listKey: LIST.operadores, required: true },
        { id: "proveedor", label: "Proveedor", type: "master-select", listKey: LIST.proveedoresEnvases, required: true },
        { id: "matricula", label: "Matrícula de la unidad", type: "text", help: "Serie alfanumérica, como aparece en la placa.", required: true },
        { id: "fletero", label: "Fletero", type: "master-select", listKey: LIST.fleteros, required: true },
        { id: "nombreChofer", label: "Nombre de chofer", type: "master-select", listKey: LIST.choferes, required: true },
      ],
    },
    {
      id: "documentacion",
      title: "Documentación",
      fields: [
        { id: "ordenCompra", label: "Orden de compra", type: "master-select", listKey: LIST.ordenesCompra, required: true },
        { id: "documentacionCompleta", label: "¿La documentación está completa?", type: "boolean", required: true },
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
        { id: "porronesOrdenados", label: "Número de porróns ordenados", type: "number", min: 0, required: true },
        { id: "porronesRecibidos", label: "Número de porróns recibidos", type: "number", min: 0, required: true },
        {
          id: "diferencia",
          label: "Diferencia",
          type: "calculated",
          calculate: (v) => {
            const ord = numOrNull(v.porronesOrdenados);
            const rec = numOrNull(v.porronesRecibidos);
            if (ord === null || rec === null) return null;
            return Math.abs(rec - ord);
          },
          alertTone: "info",
          alertIf: (v) => {
            const ord = numOrNull(v.porronesOrdenados);
            const rec = numOrNull(v.porronesRecibidos);
            if (ord === null || rec === null) return null;
            const diff = rec - ord;
            if (diff === 0) return null;
            const n = Math.abs(diff);
            const uno = n === 1;
            return diff > 0
              ? `Se está${uno ? "" : "n"} recibiendo ${n} porrón${uno ? "" : "s"} más de los ordenados.`
              : `Falta${uno ? "" : "n"} ${n} porrón${uno ? "" : "s"} respecto a lo ordenado.`;
          },
        },
      ],
    },
    {
      id: "inspeccion-envase",
      title: "Inspección del porrón",
      fields: [
        { id: "limpioExterno", label: "¿El porrón está limpio externamente?", type: "boolean", required: true },
        { id: "limpioInterno", label: "¿El porrón está limpio internamente?", type: "boolean", required: true },
        { id: "estadoGeneral", label: "Estado general del porrón", type: "select", options: ESTADO_4, required: true },
        { id: "presentaDanos", label: "¿Presenta daños?", type: "boolean", required: true },
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
      id: "aceptacion",
      title: "Aceptación",
      fields: [
        { id: "porronesRechazados", label: "Número de porróns rechazados", type: "number", min: 0, required: true },
        {
          id: "motivoRechazo",
          label: "Motivo del rechazo",
          type: "textarea",
          showIf: (v) => {
            const n = numOrNull(v.porronesRechazados);
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
