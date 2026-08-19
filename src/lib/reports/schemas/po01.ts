import { ReportDef } from "../types";
import { LIST, ESTADO_BOLSAS } from "../options";
import { numOrNull } from "../util";

export const po01: ReportDef = {
  code: "PO-01",
  title: "Reporte de recepción de materia prima",
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
          label: "Operador",
          type: "master-select",
          listKey: LIST.operadores,
          required: true,
        },
        {
          id: "proveedorUrea",
          label: "Proveedor de urea",
          type: "master-select",
          listKey: LIST.proveedoresUrea,
          required: true,
        },
        {
          id: "contenedor",
          label: "Contenedor / Camión",
          type: "master-select",
          listKey: LIST.contenedores,
          required: true,
        },
        {
          id: "numeroLoteProveedor",
          label: "Número de lote del proveedor",
          type: "text",
          required: true,
        },
        {
          id: "ordenCompra",
          label: "Orden de compra",
          type: "master-select",
          listKey: LIST.ordenesCompra,
          required: true,
          help: "Busca o agrega la orden de compra correspondiente.",
        },
      ],
    },
    {
      id: "revision-documental",
      title: "Revisión documental",
      fields: [
        { id: "coaRecibido", label: "¿Se recibió el Certificado de Análisis (COA)?", type: "boolean", required: true },
        { id: "ocCoincide", label: "¿La orden de compra coincide con el material recibido?", type: "boolean", required: true },
        { id: "loteCoincideCoa", label: "¿La información del lote coincide con el COA?", type: "boolean", required: true },
      ],
    },
    {
      id: "inspeccion-visual",
      title: "Inspección visual",
      fields: [
        { id: "estadoBolsas", label: "Estado de las bolsas", type: "select", options: ESTADO_BOLSAS, required: true },
        { id: "bolsasDanadas", label: "¿Se encontraron bolsas dañadas?", type: "boolean", required: true },
        {
          id: "cuantasBolsasDanadas",
          label: "¿Cuántas?",
          type: "number",
          min: 0,
          showIf: (v) => v.bolsasDanadas === true,
          required: true,
        },
        {
          id: "colorProducto",
          label: "Color del producto",
          type: "select",
          options: [
            { value: "Blanco", label: "Blanco" },
            { value: "Blanco ligeramente amarillento", label: "Blanco ligeramente amarillento" },
            { value: "Amarillento", label: "Amarillento" },
          ],
          required: true,
        },
        {
          id: "olor",
          label: "Olor",
          type: "select",
          options: [
            { value: "Sin olor", label: "Sin olor" },
            { value: "Olor normal", label: "Olor normal" },
            { value: "Olor extraño", label: "Olor extraño" },
          ],
          required: true,
        },
        { id: "humedad", label: "¿Se detectó humedad?", type: "boolean", required: true },
        {
          id: "contaminantes",
          label: "¿Se observaron contaminantes?",
          type: "select",
          options: [
            { value: "No", label: "No" },
            { value: "Polvo", label: "Polvo" },
            { value: "Otro", label: "Otro" },
          ],
          required: true,
        },
        {
          id: "contaminantesOtro",
          label: "¿Cuál contaminante?",
          type: "text",
          showIf: (v) => v.contaminantes === "Otro",
          required: true,
        },
        {
          id: "estadoPallet",
          label: "Estado del pallet",
          type: "select",
          options: [
            { value: "Bueno", label: "Bueno" },
            { value: "Dañado", label: "Dañado" },
          ],
          required: true,
        },
        {
          id: "estadoEmpaque",
          label: "Estado del empaque",
          type: "select",
          options: [
            { value: "Bueno", label: "Bueno" },
            { value: "Roto", label: "Roto" },
            { value: "Mojado", label: "Mojado" },
            { value: "Rasgado", label: "Rasgado" },
          ],
          required: true,
        },
      ],
    },
    {
      id: "cantidades",
      title: "Cantidades",
      fields: [
        { id: "bolsasSolicitadas", label: "Número de bolsas solicitadas", type: "number", min: 0, required: true },
        { id: "bolsasRecibidas", label: "Número de bolsas recibidas", type: "number", min: 0, required: true },
        {
          id: "diferenciaBolsas",
          label: "Diferencia",
          type: "calculated",
          // Siempre positiva: el sentido de la diferencia lo dice la nota,
          // no el signo, que en captura rápida se lee mal.
          calculate: (v) => {
            const sol = numOrNull(v.bolsasSolicitadas);
            const rec = numOrNull(v.bolsasRecibidas);
            if (sol === null || rec === null) return null;
            return Math.abs(rec - sol);
          },
          alertTone: "info",
          alertIf: (v) => {
            const sol = numOrNull(v.bolsasSolicitadas);
            const rec = numOrNull(v.bolsasRecibidas);
            if (sol === null || rec === null) return null;
            const diff = rec - sol;
            if (diff === 0) return null;
            const n = Math.abs(diff);
            const una = n === 1;
            return diff > 0
              ? `Se está${una ? "" : "n"} recibiendo ${n} bolsa${una ? "" : "s"} más de las solicitadas.`
              : `Falta${una ? "" : "n"} ${n} bolsa${una ? "" : "s"} respecto a lo solicitado.`;
          },
        },
      ],
    },
    {
      id: "muestreo",
      title: "Muestreo",
      fields: [
        { id: "seTomoMuestra", label: "¿Se tomó muestra?", type: "boolean", required: true },
        {
          id: "numeroMuestra",
          label: "Número de muestra",
          type: "auto-number",
          showIf: (v) => v.seTomoMuestra === true,
        },
        {
          id: "porcentajeMuestra",
          label: "Porcentaje de muestra tomada",
          type: "number",
          unit: "%",
          defaultValue: 20,
          showIf: (v) => v.seTomoMuestra === true,
        },
        {
          id: "responsableMuestreo",
          label: "Responsable del muestreo",
          type: "master-select",
          listKey: LIST.operadores,
          showIf: (v) => v.seTomoMuestra === true,
        },
      ],
    },
    {
      id: "liberacion",
      title: "Liberación",
      fields: [
        { id: "materiaPrimaAprobada", label: "¿Materia prima aprobada?", type: "boolean", required: true },
        {
          id: "motivoRechazo",
          label: "Motivo del rechazo",
          type: "select",
          options: [
            "Bolsas dañadas",
            "COA incorrecto",
            "Contaminación",
            "Humedad",
            "Color fuera de especificación",
            "Olor anormal",
            "Cantidad incorrecta",
            "Otro",
          ].map((v) => ({ value: v, label: v })),
          showIf: (v) => v.materiaPrimaAprobada === false,
          required: true,
        },
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "comentarios", label: "Comentarios", type: "textarea" },
        { id: "firma", label: "Firma de Operador / Supervisor", type: "signature", required: true },
      ],
    },
  ],
};
