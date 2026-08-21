import { ReportDef } from "../types";
import { po01 } from "./po01";
import { po02 } from "./po02";
import { po03 } from "./po03";
import { po04 } from "./po04";
import { po05 } from "./po05";
import { po06 } from "./po06";
import { po07 } from "./po07";
import { po08 } from "./po08";
import { po09 } from "./po09";
import { po10 } from "./po10";
import { po11 } from "./po11";
import { po12 } from "./po12";
import { pc01 } from "./pc01";
import { pc02 } from "./pc02";
import { pc03 } from "./pc03";
import { pc04 } from "./pc04";
import { pc05 } from "./pc05";
import { ev01 } from "./ev01";

export const REPORTS: ReportDef[] = [
  po01,
  po02,
  po03,
  po04,
  po05,
  po06,
  po07,
  po08,
  po09,
  po10,
  po11,
  po12,
  pc01,
  pc02,
  pc03,
  pc04,
  pc05,
  ev01,
];

export function getReportDef(code: string): ReportDef | undefined {
  return REPORTS.find((r) => r.code.toLowerCase() === code.toLowerCase());
}

/** Campos que ocupan una columna propia. Excluye las secciones repetibles,
 * que no tienen un número fijo de entradas y se resumen aparte. */
export function allFieldsOf(report: ReportDef) {
  return report.sections.filter((s) => !s.repetible).flatMap((s) => s.fields);
}

/** Las secciones que se capturan como lista. */
export function repeatableSectionsOf(report: ReportDef) {
  return report.sections.filter((s) => s.repetible);
}
