import { ReportDef } from "../types";
import { LIST, TANQUES_MEZCLADO } from "../options";
import { numOrNull } from "../util";

const CONC_MIN = 31.8;
const CONC_MAX = 33.2;
const TEMP_AGUA_MIN = 38;

export const po03: ReportDef = {
  code: "PO-03",
  title: "Reporte de proceso de mezclado de urea",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        {
          // El mezclado es donde la urea recibida se convierte en DEF, así
          // que es el único punto que puede emitir el lote de producción y
          // enlazar la recepción con el envasado. El servidor lo asigna al
          // guardar para que no se repita entre operadores.
          id: "loteProduccion",
          label: "Lote de producción generado",
          type: "calculated",
          help: "Se asigna automáticamente al guardar y queda disponible para los reportes de envasado.",
          calculate: () => null,
        },
        { id: "fecha", label: "Fecha", type: "date", required: true },
        { id: "horaInicio", label: "Hora de inicio", type: "time", required: true },
        { id: "horaFin", label: "Hora de finalización", type: "time", required: true },
        {
          id: "operador",
          label: "Operador responsable",
          type: "master-select",
          listKey: LIST.operadores,
          required: true,
        },
        {
          id: "tanque",
          label: "Tanque utilizado",
          type: "select",
          options: TANQUES_MEZCLADO,
          required: true,
        },
      ],
    },
    {
      id: "materia-prima",
      title: "Materia prima",
      fields: [
        {
          id: "loteUrea",
          label: "¿Qué lote de urea se utilizó?",
          type: "master-select",
          listKey: LIST.lotesUreaMateriaPrima,
          required: true,
        },
        { id: "bolsasUtilizadas", label: "¿Cuántas bolsas se utilizaron?", type: "number", min: 0, required: true },
        { id: "loteCompleto", label: "¿Se utilizó el lote completo?", type: "boolean", required: true },
        {
          id: "bolsasDisponibles",
          label: "¿Cuántas bolsas quedaron disponibles?",
          type: "number",
          min: 0,
          showIf: (v) => v.loteCompleto === false,
          required: true,
        },
      ],
    },
    {
      id: "agua",
      title: "Agua",
      fields: [
        {
          id: "tanqueAgua",
          label: "¿Qué tanque de agua se utilizó?",
          type: "master-select",
          listKey: LIST.tanquesAguaCruda,
          required: true,
        },
        { id: "m3Agua", label: "¿Cuántos m³ de agua se utilizaron?", type: "number", min: 0, unit: "m³", required: true },
        {
          id: "temperaturaAgua",
          label: "Temperatura promedio del agua",
          type: "number",
          unit: "°C",
          min: TEMP_AGUA_MIN,
          required: true,
          alertIf: (v) => {
            const t = numOrNull(v.temperaturaAgua);
            if (t === null) return null;
            return t < TEMP_AGUA_MIN
              ? `⚠️ El agua no está dentro del rango de temperatura (mínimo ${TEMP_AGUA_MIN} °C).`
              : null;
          },
        },
      ],
    },
    {
      id: "produccion",
      title: "Producción",
      fields: [
        { id: "inicioCorrecto", label: "¿Se inició correctamente el mezclado?", type: "boolean", required: true },
        {
          id: "motivoNoInicio",
          label: "Motivo",
          type: "select",
          options: [
            "Falla de bomba",
            "Falla de mixer",
            "Falta de agua",
            "Falta de urea",
            "Falla eléctrica",
            "Otro",
          ].map((v) => ({ value: v, label: v })),
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
        { id: "tiempoMezclado", label: "Tiempo de mezclado", type: "number", unit: "min", min: 0 },
      ],
    },
    {
      id: "calidad",
      title: "Calidad",
      fields: [
        { id: "concentracionObtenida", label: "Concentración obtenida", type: "number", unit: "%", required: true },
        {
          id: "concentracionCumple",
          label: `¿La concentración cumple especificación (${CONC_MIN}–${CONC_MAX} %)?`,
          type: "calculated",
          calculate: (v) => {
            const c = numOrNull(v.concentracionObtenida);
            if (c === null) return null;
            return c >= CONC_MIN && c <= CONC_MAX ? "Sí" : "No";
          },
          alertIf: (v) => {
            const c = numOrNull(v.concentracionObtenida);
            if (c === null) return null;
            return c >= CONC_MIN && c <= CONC_MAX ? null : "⚠️ Concentración fuera de especificación.";
          },
        },
        {
          id: "ajusteRealizado",
          label: "¿Qué ajuste se realizó?",
          type: "select",
          options: ["Agregar agua", "Agregar urea", "Recircular", "Otro"].map((v) => ({ value: v, label: v })),
          showIf: (v) => {
            const c = numOrNull(v.concentracionObtenida);
            return c !== null && !(c >= CONC_MIN && c <= CONC_MAX);
          },
        },
        {
          id: "ajusteRealizadoOtro",
          label: "¿Cuál?",
          type: "text",
          showIf: (v) => v.ajusteRealizado === "Otro",
          required: true,
        },
        {
          id: "concentracionFinal",
          label: "Concentración final",
          type: "number",
          unit: "%",
          showIf: (v) => {
            const c = numOrNull(v.concentracionObtenida);
            return c !== null && !(c >= CONC_MIN && c <= CONC_MAX);
          },
        },
        { id: "porcentajeUreaTanque", label: "% de urea en el tanque", type: "number", unit: "%", required: true },
      ],
    },
    {
      id: "muestreo",
      title: "Muestreo",
      fields: [
        { id: "seTomoMuestra", label: "¿Se tomó muestra del lote?", type: "boolean", required: true },
        {
          id: "numeroMuestra",
          label: "Número de muestra",
          type: "auto-number",
          showIf: (v) => v.seTomoMuestra === true,
        },
      ],
    },
    {
      id: "observaciones",
      title: "Observaciones",
      fields: [
        { id: "anomalia", label: "¿Se presentó alguna anomalía durante la producción?", type: "boolean", required: true },
        {
          id: "tipoAnomalia",
          label: "Tipo de anomalía",
          type: "select",
          options: [
            "Problema con el mixer",
            "Problema con bomba",
            "Problema con válvulas",
            "Problema con agua",
            "Problema con urea",
            "Otro",
          ].map((v) => ({ value: v, label: v })),
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
        { id: "comentarios", label: "Comentarios", type: "textarea" },
      ],
    },
  ],
};
