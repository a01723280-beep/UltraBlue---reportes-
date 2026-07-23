"use client";

import { getReportDef } from "@/lib/reports/schemas";
import DynamicForm from "./DynamicForm";

interface ReportFormLoaderProps {
  reportCode: string;
  plant: string;
  initialLists: Record<string, string[]>;
}

export default function ReportFormLoader({ reportCode, plant, initialLists }: ReportFormLoaderProps) {
  const report = getReportDef(reportCode);
  if (!report) {
    return <p className="text-red-600">No se encontró la definición de este reporte.</p>;
  }
  return <DynamicForm report={report} plant={plant} initialLists={initialLists} />;
}
