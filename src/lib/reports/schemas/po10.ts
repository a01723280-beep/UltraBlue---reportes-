import { ReportDef } from "../types";
import { LIST } from "../options";

export const po10: ReportDef = {
  code: "PO-10",
  title: "Reporte de entrenamiento",
  category: "operacion",
  sections: [
    {
      id: "general",
      title: "Información general",
      fields: [
        { id: "fecha", label: "Fecha", type: "date", required: true },
        {
          id: "instructor",
          label: "Instructor",
          type: "master-select",
          listKey: LIST.instructores,
          required: true,
        },
        {
          id: "trabajadores",
          label: "Trabajador(es)",
          type: "master-select",
          listKey: LIST.operadores,
          required: true,
        },
      ],
    },
    {
      id: "contenido",
      title: "Contenido del entrenamiento",
      fields: [
        { id: "tema", label: "Tema", type: "text", required: true },
        {
          id: "categoriaVerificacion",
          label: "Verificación de conocimiento",
          type: "select",
          options: [
            { value: "Plática verbal", label: "Plática verbal" },
            { value: "Entrenamiento en sitio", label: "Entrenamiento en sitio" },
            { value: "Lectura de manual", label: "Lectura de manual" },
            { value: "Evaluación práctica", label: "Evaluación práctica" },
          ],
          required: true,
        },
        { id: "detalleVerificacion", label: "Detalle adicional", type: "textarea" },
      ],
    },
    {
      id: "cierre",
      title: "Evidencia",
      fields: [
        { id: "evidenciaFoto", label: "Evidencia fotográfica", type: "photo" },
        { id: "firma", label: "Firma del instructor", type: "signature" },
      ],
    },
  ],
};
