import { ReportDef } from "../types";
import { LIST, ESTADO_BOLSAS } from "../options";

export const pc01: ReportDef = {
  code: "PC-01",
  title: "Reporte de registro llegada de materia prima",
  category: "calidad",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "inspector", label: "Inspector de calidad", type: "master-select", listKey: LIST.inspectoresCalidad, required: true },
        { id: "proveedor", label: "Proveedor", type: "master-select", listKey: LIST.proveedoresUrea, required: true },
        { id: "numeroLote", label: "Número de lote", type: "master-select", listKey: LIST.lotesUreaMateriaPrima, required: true },
      ],
    },
    {
      id: "revision-documental",
      title: "Revisión documental",
      fields: [
        { id: "coaRecibido", label: "¿Se recibió el CoA?", type: "boolean", required: true },
        { id: "coaCorresponde", label: "¿El CoA corresponde al lote recibido?", type: "boolean", required: true },
        { id: "coaCumpleEspecificacion", label: "¿Los datos del CoA cumplen con la especificación?", type: "boolean", required: true },
      ],
    },
    {
      id: "inspeccion-visual",
      title: "Inspección visual",
      fields: [
        { id: "estadoBolsas", label: "Estado de las bolsas", type: "select", options: ESTADO_BOLSAS, required: true },
        {
          id: "colorProducto",
          label: "Color del producto",
          type: "select",
          options: ["Blanco", "Blanco ligeramente amarillento", "Amarillento", "Otro"].map((v) => ({ value: v, label: v })),
          required: true,
        },
        {
          id: "olorProducto",
          label: "Olor del producto",
          type: "select",
          options: [
            { value: "Normal", label: "Normal" },
            { value: "Anormal", label: "Anormal" },
          ],
          required: true,
        },
        { id: "humedad", label: "¿Se detectó humedad?", type: "boolean", required: true },
        { id: "contaminacion", label: "¿Se detectó contaminación?", type: "boolean", required: true },
        {
          id: "tipoContaminacion",
          label: "Tipo de contaminación",
          type: "select",
          options: ["Tierra", "Polvo", "Aceite", "Material extraño", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.contaminacion === true,
          required: true,
        },
      ],
    },
    {
      id: "cantidad",
      title: "Cantidad recibida",
      fields: [{ id: "bolsasInspeccionadas", label: "Número de bolsas inspeccionadas", type: "number", min: 0, required: true }],
    },
    {
      id: "muestreo",
      title: "Muestreo",
      fields: [
        { id: "muestraFisica", label: "¿Se tomó muestra física?", type: "boolean", required: true },
        { id: "numeroMuestra", label: "Número de muestra", type: "auto-number", showIf: (v) => v.muestraFisica === true },
        {
          id: "porcentajeMuestreo",
          label: "Porcentaje de muestreo",
          type: "select",
          options: [
            { value: "20%", label: "20%" },
            { value: "Otro", label: "Otro" },
          ],
          defaultValue: "20%",
          showIf: (v) => v.muestraFisica === true,
        },
        {
          id: "porcentajeMuestreoOtro",
          label: "Especifique el porcentaje",
          type: "number",
          unit: "%",
          showIf: (v) => v.muestraFisica === true && v.porcentajeMuestreo === "Otro",
          required: true,
        },
      ],
    },
    {
      id: "laboratorio",
      title: "Laboratorio",
      fields: [
        { id: "enviadaLaboratorio", label: "¿La muestra fue enviada al laboratorio?", type: "boolean", required: true },
        { id: "fechaEnvio", label: "Fecha de envío", type: "date", showIf: (v) => v.enviadaLaboratorio === true },
        { id: "responsableLaboratorio", label: "Responsable del laboratorio", type: "master-select", listKey: LIST.responsablesLaboratorio, showIf: (v) => v.enviadaLaboratorio === true },
        {
          id: "estadoAnalisis",
          label: "Estado del análisis",
          type: "select",
          options: [
            { value: "Pendiente", label: "Pendiente" },
            { value: "Aprobado", label: "Aprobado" },
            { value: "Rechazado", label: "Rechazado" },
          ],
          required: true,
        },
        {
          id: "motivoRechazo",
          label: "Motivo",
          type: "select",
          options: ["Concentración fuera de especificación", "Contaminación", "Humedad", "Color", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.estadoAnalisis === "Rechazado",
          required: true,
        },
      ],
    },
    {
      id: "liberacion",
      title: "Liberación",
      fields: [
        {
          id: "loteLiberado",
          label: "¿El lote queda liberado para producción?",
          type: "select",
          options: [
            { value: "Sí", label: "Sí" },
            { value: "No", label: "No" },
            { value: "En espera de resultados", label: "En espera de resultados" },
          ],
          required: true,
        },
      ],
    },
    {
      id: "seguimiento",
      title: "Seguimiento del rechazo",
      showIf: (v) => v.loteLiberado === "No",
      fields: [
        { id: "etiquetaCuarentena", label: "¿Se colocó etiqueta de cuarentena?", type: "boolean" },
        { id: "loteAislado", label: "¿Se aisló el lote?", type: "boolean" },
        { id: "requiereAccionCorrectiva", label: "¿Requiere acción correctiva?", type: "boolean" },
        { id: "proveedorNotificado", label: "¿Se notificó al proveedor?", type: "boolean" },
        { id: "reporteNoConformidad", label: "¿Se generó un reporte de No Conformidad?", type: "boolean", help: "Requerido para trazabilidad ISO 22241." },
        { id: "numeroNoConformidad", label: "Número de No Conformidad", type: "text", showIf: (v) => v.reporteNoConformidad === true },
        { id: "proveedorAceptoRechazo", label: "¿El proveedor aceptó el rechazo?", type: "boolean" },
      ],
    },
    {
      id: "liberacion-etiqueta",
      title: "Etiquetado",
      showIf: (v) => v.loteLiberado === "Sí",
      fields: [{ id: "etiquetaLiberacion", label: "¿Se colocó etiqueta de liberación?", type: "boolean" }],
    },
    {
      id: "evidencia",
      title: "Evidencia y comentarios",
      fields: [
        { id: "evidenciaFotografica", label: "Evidencia fotográfica", type: "photo" },
        { id: "comentariosLaboratorio", label: "Comentarios del laboratorio", type: "textarea" },
        { id: "observaciones", label: "Observaciones", type: "textarea" },
      ],
    },
  ],
};
