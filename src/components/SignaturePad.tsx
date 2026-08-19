"use client";

import { useEffect, useRef } from "react";

interface SignaturePadProps {
  value: string | null | undefined;
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  // Lo último que se pintó, para no volver a dibujar el trazo que acabamos de
  // emitir nosotros mismos.
  const rendered = useRef<string | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  // El lienzo tiene que seguir al valor del formulario: si al guardar un
  // reporte se limpia, el trazo del reporte anterior no puede quedarse
  // pintado y acabar firmando el siguiente.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const next = value || null;
    if (next === rendered.current) return;
    rendered.current = next;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (next) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = next;
    }
  }, [value]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const dataUrl = canvasRef.current!.toDataURL("image/png");
    // Ya está pintado en pantalla: registrarlo evita que el efecto lo
    // vuelva a dibujar encima.
    rendered.current = dataUrl;
    onChange(dataUrl);
  }

  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    rendered.current = null;
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={480}
        height={160}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full max-w-md touch-none rounded-lg border-2 border-dashed border-slate-300 bg-white"
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={clear} className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700">
          Borrar firma
        </button>
        {value && <span className="text-sm text-emerald-600">Firma capturada</span>}
      </div>
    </div>
  );
}
