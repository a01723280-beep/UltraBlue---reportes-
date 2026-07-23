"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { ReportDef, FieldDef, FormValues } from "@/lib/reports/types";
import { generateFolio } from "@/lib/folio";
import MasterSelect from "./MasterSelect";
import SignaturePad from "./SignaturePad";

interface DynamicFormProps {
  report: ReportDef;
  plant: string;
  initialLists: Record<string, string[]>;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function buildDefaultValues(report: ReportDef): FormValues {
  const values: FormValues = {};
  for (const section of report.sections) {
    for (const field of section.fields) {
      if (field.type === "date") values[field.id] = today();
      else if (field.type === "time") values[field.id] = nowTime();
      else if (field.defaultValue !== undefined) values[field.id] = field.defaultValue;
    }
  }
  return values;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DynamicForm({ report, plant, initialLists }: DynamicFormProps) {
  const [lists, setLists] = useState<Record<string, string[]>>(initialLists);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const defaultValues = useMemo(() => buildDefaultValues(report), [report]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({ defaultValues, shouldUnregister: true });

  const values = watch() as FormValues;

  function updateListOptions(listKey: string, options: string[]) {
    setLists((prev) => ({ ...prev, [listKey]: options }));
  }

  function findOperatorValue(payload: FormValues): string | null {
    for (const key of Object.keys(payload)) {
      if (/operador|inspector/i.test(key) && typeof payload[key] === "string") {
        return payload[key] as string;
      }
    }
    return null;
  }

  async function onSubmit(formValues: FieldValues) {
    setStatus("saving");
    setErrorMsg(null);
    const payload: FormValues = {};
    for (const section of report.sections) {
      if (section.showIf && !section.showIf(formValues as FormValues)) continue;
      for (const field of section.fields) {
        if (field.showIf && !field.showIf(formValues as FormValues)) continue;
        if (field.type === "calculated") {
          payload[field.id] = field.calculate ? field.calculate(formValues as FormValues) : null;
        } else if (field.type === "auto-number") {
          payload[field.id] = generateFolio(report.code, plant);
        } else {
          payload[field.id] = formValues[field.id] ?? null;
        }
      }
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: report.code,
          plant,
          operator: findOperatorValue(payload),
          data: payload,
        }),
      });
      if (!res.ok) throw new Error("save-failed");
      setStatus("saved");
      reset(buildDefaultValues(report));
    } catch {
      setStatus("error");
      setErrorMsg("No se pudo guardar el reporte. Verifica tu conexión e intenta de nuevo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {report.sections.map((section) => {
        if (section.showIf && !section.showIf(values)) return null;
        const visibleFields = section.fields.filter((f) => !f.showIf || f.showIf(values));
        if (visibleFields.length === 0) return null;
        return (
          <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">{section.title}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {visibleFields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  plant={plant}
                  values={values}
                  register={register}
                  control={control}
                  errors={errors}
                  lists={lists}
                  updateListOptions={updateListOptions}
                  fileToDataUrl={fileToDataUrl}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="sticky bottom-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-between">
        <div className="text-sm">
          {status === "saved" && (
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <CheckCircle2 size={18} /> Reporte guardado correctamente.
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 font-medium text-red-600">
              <AlertTriangle size={18} /> {errorMsg}
            </span>
          )}
          {status === "idle" && <span className="text-slate-500">Revisa las respuestas antes de guardar.</span>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={18} />}
          Guardar reporte
        </button>
      </div>
    </form>
  );
}

interface FieldRendererProps {
  field: FieldDef;
  plant: string;
  values: FormValues;
  register: ReturnType<typeof useForm>["register"];
  control: ReturnType<typeof useForm>["control"];
  errors: ReturnType<typeof useForm>["formState"]["errors"];
  lists: Record<string, string[]>;
  updateListOptions: (listKey: string, options: string[]) => void;
  fileToDataUrl: (f: File) => Promise<string>;
}

function FieldRenderer({
  field,
  plant,
  values,
  register,
  control,
  errors,
  lists,
  updateListOptions,
  fileToDataUrl,
}: FieldRendererProps) {
  const wide = field.type === "textarea" || field.type === "signature" || field.type === "photo";
  const error = errors[field.id];
  const alert = field.alertIf ? field.alertIf(values) : null;

  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={field.id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-500">*</span>}
        {field.unit && <span className="ml-1 text-slate-400">({field.unit})</span>}
      </label>
      {field.help && <p className="mb-1.5 text-xs text-slate-500">{field.help}</p>}

      {field.type === "text" && (
        <input
          id={field.id}
          type="text"
          {...register(field.id, { required: field.required })}
          className={inputClass}
        />
      )}

      {field.type === "textarea" && (
        <textarea id={field.id} rows={3} {...register(field.id, { required: field.required })} className={inputClass} />
      )}

      {field.type === "number" && (
        <input
          id={field.id}
          type="number"
          step={field.step ?? "any"}
          min={field.min}
          max={field.max}
          {...register(field.id, { required: field.required, valueAsNumber: true })}
          className={inputClass}
        />
      )}

      {field.type === "date" && (
        <input id={field.id} type="date" {...register(field.id, { required: field.required })} className={inputClass} />
      )}

      {field.type === "time" && (
        <input id={field.id} type="time" {...register(field.id, { required: field.required })} className={inputClass} />
      )}

      {field.type === "select" && (
        <select id={field.id} {...register(field.id, { required: field.required })} defaultValue="" className={inputClass}>
          <option value="" disabled>
            Selecciona…
          </option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "boolean" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ validate: (v) => (field.required ? v === true || v === false || "Requerido" : true) }}
          render={({ field: { value, onChange } }) => (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange(true)}
                className={toggleClass(value === true, "yes")}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => onChange(false)}
                className={toggleClass(value === false, "no")}
              >
                No
              </button>
            </div>
          )}
        />
      )}

      {field.type === "master-select" && field.listKey && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required }}
          render={({ field: { value, onChange } }) => (
            <MasterSelect
              id={field.id}
              plant={plant}
              listKey={field.listKey!}
              value={value ?? ""}
              onChange={onChange}
              options={lists[field.listKey!] ?? []}
              onOptionsChange={(opts) => updateListOptions(field.listKey!, opts)}
              required={field.required}
            />
          )}
        />
      )}

      {field.type === "auto-number" && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
          Se generará automáticamente al guardar
        </div>
      )}

      {field.type === "calculated" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
          {field.calculate ? (field.calculate(values) ?? "—") : "—"}
        </div>
      )}

      {field.type === "signature" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required }}
          render={({ field: { value, onChange } }) => <SignaturePad value={value as string | null} onChange={onChange} />}
        />
      )}

      {field.type === "photo" && (
        <Controller
          name={field.id}
          control={control}
          render={({ field: { value, onChange } }) => {
            const photos = (value as { name: string; dataUrl: string }[] | undefined) ?? [];
            return (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const next = await Promise.all(
                      files.map(async (f) => ({ name: f.name, dataUrl: await fileToDataUrl(f) }))
                    );
                    onChange([...photos, ...next]);
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sky-700 hover:file:bg-sky-100"
                />
                {photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {photos.map((p, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={p.dataUrl} alt={p.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      {alert && <p className="mt-1.5 text-sm font-medium text-amber-600">{alert}</p>}
      {error && <p className="mt-1.5 text-sm text-red-600">Este campo es obligatorio.</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100";

function toggleClass(active: boolean, kind: "yes" | "no") {
  const base = "flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition";
  if (!active) return `${base} border-slate-300 bg-white text-slate-500 hover:bg-slate-50`;
  return kind === "yes"
    ? `${base} border-emerald-600 bg-emerald-600 text-white`
    : `${base} border-red-500 bg-red-500 text-white`;
}
