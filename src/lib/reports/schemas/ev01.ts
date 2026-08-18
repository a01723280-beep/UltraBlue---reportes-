import { ReportDef } from "../types";
import { LIST } from "../options";

export const ev01: ReportDef = {
  code: "EV-01",
  title: "Reporte de evidencias",
  category: "evidencias",
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
      ],
    },
    {
      id: "evidencia",
      title: "Evidencia",
      fields: [
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo", required: true },
        { id: "explicacion", label: "Explicación", type: "textarea" },
      ],
    },
  ],
};
