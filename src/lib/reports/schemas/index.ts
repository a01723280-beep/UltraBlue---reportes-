import { ReportDef } from "../types";
import { po01 } from "./po01";
import { po02 } from "./po02";
import { po03 } from "./po03";
import { po04 } from "./po04";
import { po05 } from "./po05";
import { po06 } from "./po06";
import { po07 } from "./po07";
import { pc01 } from "./pc01";
import { pc02 } from "./pc02";
import { pc03 } from "./pc03";
import { pc04 } from "./pc04";

export const REPORTS: ReportDef[] = [po01, po02, po03, po04, po05, po06, po07, pc01, pc02, pc03, pc04];

export function getReportDef(code: string): ReportDef | undefined {
  return REPORTS.find((r) => r.code.toLowerCase() === code.toLowerCase());
}

export function allFieldsOf(report: ReportDef) {
  return report.sections.flatMap((s) => s.fields);
}
