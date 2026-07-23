"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface MasterSelectProps {
  plant: string;
  listKey: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onOptionsChange: (options: string[]) => void;
  required?: boolean;
  id?: string;
}

export default function MasterSelect({
  plant,
  listKey,
  value,
  onChange,
  options,
  onOptionsChange,
  required,
  id,
}: MasterSelectProps) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addOption() {
    const label = newLabel.trim();
    if (!label) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/master-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plant, listKey, label }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la opción.");
      if (!options.includes(label)) onOptionsChange([...options, label]);
      onChange(label);
      setNewLabel("");
      setAdding(false);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          id={id}
          required={required}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
        >
          <option value="">Selecciona…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          title="Agregar otro"
        >
          <Plus size={16} />
          Otro
        </button>
      </div>
      {adding && (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption();
              }
            }}
            placeholder="Nuevo valor"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            disabled={saving || !newLabel.trim()}
            onClick={addOption}
            className="shrink-0 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Agregar"}
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
