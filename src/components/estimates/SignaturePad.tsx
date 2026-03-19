"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { RefreshCw } from "lucide-react";

export interface EstimateSignaturePadRef {
  isEmpty: () => boolean;
  getDataUrl: () => string;
  clear: () => void;
}

interface EstimateSignaturePadProps {
  label?: string;
  className?: string;
  height?: string;
}

export const EstimateSignaturePad = forwardRef<
  EstimateSignaturePadRef,
  EstimateSignaturePadProps
>(function EstimateSignaturePad(
  { label = "Sign here", className = "", height = "h-36" },
  ref,
) {
  const canvasRef = useRef<SignatureCanvas | null>(null);

  useImperativeHandle(ref, () => ({
    isEmpty: () => canvasRef.current?.isEmpty() ?? true,
    getDataUrl: () => {
      const canvas = canvasRef.current?.getTrimmedCanvas();
      if (!canvas) return "";
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      void ctx; // ensure context is created with the attribute
      return canvas.toDataURL("image/png");
    },
    clear: () => canvasRef.current?.clear(),
  }));

  return (
    <div className={className}>
      {label && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-inner">
        <SignatureCanvas
          ref={(v) => {
            canvasRef.current = v;
          }}
          penColor="#111827"
          canvasProps={{
            className: `${height} w-full touch-none`,
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => canvasRef.current?.clear()}
        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 transition hover:text-red-600"
      >
        <RefreshCw className="h-3 w-3" />
        Clear signature
      </button>
    </div>
  );
});
