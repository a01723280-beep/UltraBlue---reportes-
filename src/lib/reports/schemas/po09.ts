import { ReportDef } from "../types";
import { LIST, TANQUES_AGUA_CRUDA, TANQUES_AGUA_DESIONIZADA } from "../options";
import { numOrNull } from "../util";

const PH_MIN = 9;
const PH_MAX = 10;

export const po09: ReportDef = {
  code: "PO-09",
  title: "Reporte de control de ósmosis",
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
        {
          id: "unidad",
          label: "Unidad de ósmosis",
          type: "select",
          options: [
            { value: "Ósmosis 1", label: "Ósmosis 1" },
            { value: "Ósmosis 2", label: "Ósmosis 2" },
          ],
          required: true,
        },
      ],
    },
    {
      // La ósmosis es donde el agua cruda se vuelve desionizada. Sin anotar
      // de qué tanque toma y cuál llena, el agua que entra al mezclado no se
      // puede ligar hacia atrás con la que se trató aquí.
      id: "tanques",
      title: "Tanques",
      fields: [
        {
          id: "tanqueOrigen",
          label: "Tanque de agua cruda (origen)",
          type: "select",
          options: TANQUES_AGUA_CRUDA,
          required: true,
        },
        {
          id: "tanqueDestino",
          label: "Tanque de agua desionizada (destino)",
          type: "select",
          options: TANQUES_AGUA_DESIONIZADA,
          required: true,
        },
      ],
    },
    {
      id: "filtros",
      title: "Filtros de carbón",
      fields: [
        { id: "filtroCarbonEntrada", label: "Filtro carbón entrada", type: "number", required: true },
        { id: "filtroCarbonSalida", label: "Filtro carbón salida", type: "number", required: true },
      ],
    },
    {
      id: "presiones",
      title: "Presiones",
      fields: [
        { id: "presionPreFiltro", label: "Presión pre filtro", type: "number", unit: "psi", required: true },
        { id: "presionPosFiltro", label: "Presión pos filtro", type: "number", unit: "psi", required: true },
        {
          id: "presionAlimentacion",
          label: "Presión de alimentación a ósmosis",
          type: "number",
          unit: "psi",
          required: true,
        },
        {
          id: "presionRechazado",
          label: "Presión de rechazado de ósmosis",
          type: "number",
          unit: "psi",
          required: true,
        },
      ],
    },
    {
      id: "flujos",
      title: "Flujos",
      fields: [
        { id: "flujoProducto", label: "Flujo de producto", type: "number", unit: "L/min", required: true },
        { id: "flujoRechazo", label: "Flujo de rechazo", type: "number", unit: "L/min", required: true },
        {
          id: "flujoRecirculacion",
          label: "Flujo de recirculación",
          type: "number",
          unit: "L/min",
          required: true,
        },
      ],
    },
    {
      id: "suavizador",
      title: "Suavizador",
      fields: [
        { id: "durezaEntrada", label: "Dureza de entrada a suavizador", type: "number", unit: "ppm", required: true },
        { id: "durezaSalida", label: "Dureza de salida de suavizador", type: "number", unit: "ppm", required: true },
      ],
    },
    {
      id: "calidadAgua",
      title: "Calidad del agua",
      fields: [
        {
          id: "ph",
          label: `pH (especificación ${PH_MIN}–${PH_MAX})`,
          type: "number",
          step: 0.01,
          required: true,
          alertIf: (v) => {
            const x = numOrNull(v.ph);
            if (x === null) return null;
            return x < PH_MIN || x > PH_MAX
              ? `⚠️ pH fuera de especificación (${PH_MIN}–${PH_MAX}).`
              : null;
          },
        },
        {
          id: "conductividadAlimentacion",
          label: "Conductividad alimentación",
          type: "number",
          unit: "µS/cm",
          required: true,
        },
        {
          id: "conductividadProducto",
          label: "Conductividad de producto",
          type: "number",
          unit: "µS/cm",
          required: true,
        },
      ],
    },
    {
      id: "cierre",
      title: "Evidencia y comentarios",
      fields: [
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "comentarios", label: "Comentarios", type: "textarea" },
      ],
    },
  ],
};
