// Generic schema that drives both the dynamic form renderer and the Excel
// export. Every one of the 11 UltraBlue reports (PO-01..PO-07, PC-01..PC-04)
// is described as data using these types instead of being hand-coded as a
// one-off form, so adding/adjusting a question never requires touching the
// rendering or export logic.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select" // fixed set of options defined inline
  | "master-select" // options come from the editable per-plant master list (dropdown + "agregar otro")
  | "boolean" // Sí / No
  | "date"
  | "time"
  | "auto-number" // e.g. "Número de muestra": generated automatically, read-only
  | "calculated" // derived from other fields, read-only, shown live
  | "signature"
  | "photo";

export interface FieldOption {
  value: string;
  label: string;
}

export type FormValues = Record<string, unknown>;

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  options?: FieldOption[]; // for "select"
  listKey?: string; // for "master-select": which editable list to pull from
  required?: boolean;
  help?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Only rendered (and only required/saved) when this returns true. */
  showIf?: (values: FormValues) => boolean;
  /** For type "calculated": compute the displayed value from current answers. */
  calculate?: (values: FormValues) => string | number | null;
  /** Optional note shown under the field when this returns text. */
  alertIf?: (values: FormValues) => string | null;
  /** How to present `alertIf`. "warning" (default) flags something out of
   * spec; "info" just states a fact the operator should notice. */
  alertTone?: "warning" | "info";
  defaultValue?: unknown;
}

export interface SectionDef {
  id: string;
  title: string;
  fields: FieldDef[];
  showIf?: (values: FormValues) => boolean;
  /** Cuando está presente, la sección se captura como una lista de entradas
   * iguales — por ejemplo un envasado repartido entre varios clientes, cada
   * uno con su cantidad y su orden de venta. Las respuestas se guardan como
   * un arreglo bajo el id de la sección, no como campos sueltos. */
  repetible?: {
    /** Texto del botón que agrega otra entrada. */
    agregar: string;
    /** Cómo nombrar cada entrada en pantalla: "Cliente 1", "Cliente 2"… */
    singular: string;
    /** Entradas mínimas; por debajo no se puede quitar. */
    minimo?: number;
  };
}

export type ReportCategory = "operacion" | "calidad" | "evidencias";

export interface ReportDef {
  code: string; // "PO-01"
  title: string; // "Reporte de recepción de materia prima"
  category: ReportCategory;
  sections: SectionDef[];
}
