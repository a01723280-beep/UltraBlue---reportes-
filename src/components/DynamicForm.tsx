"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
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

/** Every field gets an explicit entry, including the empty ones: `reset()`
 * only clears the keys it receives, so omitting a field would leave whatever
 * the operator typed in the previous report still on screen. */
function buildDefaultValues(report: ReportDef): FormValues {
  const values: FormValues = {};
  for (const section of report.sections) {
    for (const field of section.fields) {
      if (field.type === "date") values[field.id] = today();
      else if (field.type === "time") values[field.id] = nowTime();
      else if (field.defaultValue !== undefined) values[field.id] = field.defaultValue;
      else if (field.type === "boolean") values[field.id] = null;
      else if (field.type === "photo") values[field.id] = [];
      else values[field.id] = "";
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

// A phone photo is 3-5 MB, and base64 adds ~33% on top. Submissions travel as
// one JSON body, so several full-size photos would blow past the 4.5 MB body
// limit serverless hosts impose. Downscaling to a long edge of 1600px and
// re-encoding as JPEG keeps evidence legible at roughly 150-300 KB each.
const PHOTO_MAX_EDGE = 1600;
const PHOTO_QUALITY = 0.7;

async function compressImage(file: File): Promise<string> {
  const original = await fileToDataUrl(file);
  // Anything that isn't a raster image (or fails to decode) is stored as-is.
  if (!file.type.startsWith("image/")) return original;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = original;
    });

    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(img.width, img.height));
    if (scale === 1 && file.size < 500_000) return original;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const compressed = canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
    return compressed.length < original.length ? compressed : original;
  } catch {
    return original;
  }
}

export default function DynamicForm({ report, plant, initialLists }: DynamicFormProps) {
  const [lists, setLists] = useState<Record<string, string[]>>(initialLists);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // El lote que el servidor acaba de emitir; el operador lo necesita para
  // rotular el tanque, así que se muestra hasta que empiece el siguiente.
  const [loteAsignado, setLoteAsignado] = useState<string | null>(null);
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
      const body = (await res.json()) as { loteProduccion?: string | null };
      setLoteAsignado(body.loteProduccion ?? null);
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
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="sticky bottom-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-between">
        <div className="text-sm">
          {status === "saved" && (
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <CheckCircle2 size={18} /> Reporte guardado correctamente.
              </span>
              {loteAsignado && (
                <span className="text-slate-600">
                  Lote de producción asignado:{" "}
                  <strong className="font-mono font-semibold text-slate-900">{loteAsignado}</strong>
                </span>
              )}
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
          rules={{ validate: (v) => (field.required ? (Array.isArray(v) && v.length > 0) || "Requerido" : true) }}
          render={({ field: { value, onChange } }) => (
            <PhotoField
              photos={(value as PhotoValue[] | undefined) ?? []}
              onChange={onChange}
            />
          )}
        />
      )}

      {alert && (
        <p
          className={
            field.alertTone === "info"
              ? "mt-1.5 text-sm font-medium text-slate-600"
              : "mt-1.5 text-sm font-medium text-amber-600"
          }
        >
          {alert}
        </p>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">Este campo es obligatorio.</p>}
    </div>
  );
}

interface PhotoValue {
  name: string;
  dataUrl: string;
}

/** Two entry points for the same value: "Tomar foto" sets `capture`, which makes
 * a phone open its camera straight away, while "Subir imagen" opens the normal
 * picker for photos already taken. Desktop browsers ignore `capture` and show
 * the file dialog for both. */
function PhotoField({
  photos,
  onChange,
}: {
  photos: PhotoValue[];
  onChange: (next: PhotoValue[]) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    const next = await Promise.all(
      files.map(async (f) => ({ name: f.name, dataUrl: await compressImage(f) }))
    );
    onChange([...photos, ...next]);
  }

  return (
    <div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          await addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          await addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-600 bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          <Camera size={16} /> Tomar foto
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ImagePlus size={16} /> Subir imagen
        </button>
      </div>

      {photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={`${p.name}-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.dataUrl}
                alt={p.name}
                className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <button
                type="button"
                aria-label={`Quitar ${p.name}`}
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-700 p-1 text-white transition hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
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
