"use client";

import { useState } from "react";
import CameraCapture from "./components/CameraCapture";
import DiagnosisResult from "./components/DiagnosisResult";
import { DiagnosisResult as DiagnosisResultType } from "./types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageBase64: string, mediaType: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el servidor");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
            <h1 className="text-xl font-bold text-green-800 leading-none">PlantaVida</h1>
            <p className="text-xs text-green-600 mt-0.5">Diagnóstico inteligente de plantas</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-6">
        {!result && !isLoading && (
          <p className="text-gray-600 text-sm text-center">
            Fotografía tu planta de interior y obtén un diagnóstico detallado
            impulsado por inteligencia artificial.
          </p>
        )}

        <CameraCapture onCapture={handleCapture} isLoading={isLoading} />

        {error && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">Error en el diagnóstico</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {result && <DiagnosisResult result={result} />}

        <p className="text-xs text-gray-400 text-center mt-4">
          Diagnóstico generado con Claude AI · Solo para plantas de interior
        </p>
      </main>
    </div>
  );
}
