import Link from "next/link";
import { Factory } from "lucide-react";
import { PLANTS } from "@/lib/plants";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700">
          <Factory size={16} /> UltraBlue
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Reportes de planta</h1>
        <p className="mt-3 text-slate-500">Selecciona la planta en la que estás operando para continuar.</p>
      </div>

      <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
        {PLANTS.map((plant) => (
          <Link
            key={plant.slug}
            href={`/${plant.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
              <Factory size={26} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{plant.name}</div>
              <div className="text-sm text-slate-500">{plant.fullName}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
