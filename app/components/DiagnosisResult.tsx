"use client";

import { DiagnosisResult as DiagnosisResultType, EstadoSalud, Gravedad, CategoriaRecomendacion } from "../types";

interface DiagnosisResultProps {
  result: DiagnosisResultType;
}

const estadoConfig: Record<EstadoSalud, { color: string; bg: string; border: string; label: string; emoji: string }> = {
  saludable: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    label: "Saludable",
    emoji: "✅",
  },
  advertencia: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Necesita atención",
    emoji: "⚠️",
  },
  critico: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Estado crítico",
    emoji: "🚨",
  },
};

const gravedadConfig: Record<Gravedad, { color: string; bg: string; label: string }> = {
  leve: { color: "text-blue-700", bg: "bg-blue-100", label: "Leve" },
  moderado: { color: "text-amber-700", bg: "bg-amber-100", label: "Moderado" },
  grave: { color: "text-red-700", bg: "bg-red-100", label: "Grave" },
};

const categoriaEmoji: Record<CategoriaRecomendacion, string> = {
  riego: "💧",
  luz: "☀️",
  nutrientes: "🌱",
  plagas: "🐛",
  trasplante: "🪴",
  otro: "📋",
};

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Salud general</span>
        <span className="font-bold">{score}/100</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function DiagnosisResult({ result }: DiagnosisResultProps) {
  const estado = estadoConfig[result.estadoGeneral] ?? estadoConfig.advertencia;

  return (
    <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn">
      {/* Header */}
      <div className={`rounded-2xl p-5 border-2 ${estado.bg} ${estado.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Planta identificada</p>
            <h2 className="text-xl font-bold text-gray-800">{result.nombrePlanta}</h2>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${estado.bg} ${estado.color} border ${estado.border} whitespace-nowrap`}>
            <span>{estado.emoji}</span>
            <span>{estado.label}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">{result.descripcionEstado}</p>
        <div className="mt-4">
          <HealthBar score={result.puntuacionSalud} />
        </div>
      </div>

      {/* Problemas detectados */}
      {result.problemasDetectados.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Problemas detectados</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {result.problemasDetectados.map((problema, i) => {
              const grav = gravedadConfig[problema.gravedad] ?? gravedadConfig.leve;
              return (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-800">{problema.tipo}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${grav.bg} ${grav.color}`}>
                      {grav.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{problema.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {result.recomendaciones.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Recomendaciones</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {result.recomendaciones.map((rec, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <span className="text-xl mt-0.5">{categoriaEmoji[rec.categoria] ?? "📋"}</span>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {rec.categoria}
                  </span>
                  <p className="text-sm text-gray-700 mt-0.5">{rec.accion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curiosidad */}
      {result.curiosidad && (
        <div className="bg-green-50 rounded-2xl border border-green-200 px-4 py-3 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">¿Sabías que...?</p>
            <p className="text-sm text-green-800">{result.curiosidad}</p>
          </div>
        </div>
      )}
    </div>
  );
}
