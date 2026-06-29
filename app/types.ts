export type EstadoSalud = "saludable" | "advertencia" | "critico";
export type Gravedad = "leve" | "moderado" | "grave";
export type CategoriaRecomendacion =
  | "riego"
  | "luz"
  | "nutrientes"
  | "plagas"
  | "trasplante"
  | "otro";

export interface Problema {
  tipo: string;
  descripcion: string;
  gravedad: Gravedad;
}

export interface Recomendacion {
  categoria: CategoriaRecomendacion;
  accion: string;
}

export interface DiagnosisResult {
  nombrePlanta: string;
  estadoGeneral: EstadoSalud;
  puntuacionSalud: number;
  descripcionEstado: string;
  problemasDetectados: Problema[];
  recomendaciones: Recomendacion[];
  curiosidad: string;
}
