import { ReportDef, FormValues } from "../types";
import { LIST, EQUIPOS_CALIBRACION, EQUIPOS_CALIBRACION_OPTIONS } from "../options";

// La norma interna fija la vigencia de calibración en 3 años.
const VIGENCIA_ANIOS = 3;

function equipoDe(values: FormValues) {
  const nombre = values.equipo;
  return typeof nombre === "string" ? EQUIPOS_CALIBRACION[nombre] : undefined;
}

export const pc05: ReportDef = {
  code: "PC-05",
  title: "Registro de equipos (calibración)",
  category: "calidad",
  sections: [
    {
      id: "equipo",
      title: "Equipo",
      fields: [
        {
          id: "equipo",
          label: "Equipo",
          type: "select",
          options: EQUIPOS_CALIBRACION_OPTIONS,
          required: true,
        },
        {
          id: "funcion",
          label: "Función",
          type: "calculated",
          calculate: (v) => equipoDe(v)?.funcion ?? null,
        },
        {
          id: "marca",
          label: "Marca",
          type: "calculated",
          calculate: (v) => equipoDe(v)?.marca ?? null,
        },
        {
          id: "serie",
          label: "Número de serie",
          type: "calculated",
          calculate: (v) => equipoDe(v)?.serie ?? null,
        },
        {
          id: "codigo",
          label: "Código",
          type: "calculated",
          calculate: (v) => equipoDe(v)?.codigo ?? null,
        },
      ],
    },
    {
      id: "calibracion",
      title: "Calibración",
      fields: [
        {
          id: "inspector",
          label: "Responsable",
          type: "master-select",
          listKey: LIST.inspectoresCalidad,
          required: true,
        },
        { id: "fechaCalibracion", label: "Fecha de calibración", type: "date", required: true },
        {
          id: "fechaRecalibracion",
          label: `Fecha de recalibración (calculada: +${VIGENCIA_ANIOS} años)`,
          type: "calculated",
          calculate: (v) => {
            const fecha = v.fechaCalibracion;
            if (typeof fecha !== "string" || fecha === "") return null;
            const d = new Date(`${fecha}T00:00:00`);
            if (Number.isNaN(d.getTime())) return null;
            d.setFullYear(d.getFullYear() + VIGENCIA_ANIOS);
            const mes = String(d.getMonth() + 1).padStart(2, "0");
            const dia = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${mes}-${dia}`;
          },
        },
        {
          id: "calibracionEnPlanta",
          label: "¿La calibración se realizó en planta?",
          type: "boolean",
          required: true,
        },
        {
          id: "lugarCalibracion",
          label: "Lugar de calibración",
          type: "text",
          showIf: (v) => v.calibracionEnPlanta === false,
          required: true,
        },
      ],
    },
    {
      id: "cierre",
      title: "Evidencia y comentarios",
      fields: [
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "observaciones", label: "Observaciones", type: "textarea" },
      ],
    },
  ],
};
