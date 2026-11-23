/** SiembraCreate (app/schemas/produccion.py). Fecha serializada como YYYY-MM-DD. */
export interface SiembraCreate {
  /** Vacío/null => el trigger del backend autogenera el código. */
  ID_Siembra?: string | null;
  ID_Lote: string;
  ID_Variedad: string;
  ID_Campana: string;
  Fecha_Siembra: string;
  Fecha_Cosecha?: string | null;
  /** Decimal de Pydantic puede serializarse como number o como string. */
  Kg_Cosechados?: number | string | null;
  activo?: boolean | null;
}

/** SiembraResponse: mismos 8 campos que SiembraCreate (from_attributes=True). */
export interface SiembraResponse {
  ID_Siembra: string;
  ID_Lote: string;
  ID_Variedad: string;
  ID_Campana: string;
  Fecha_Siembra: string;
  Fecha_Cosecha: string | null;
  Kg_Cosechados: number | string | null;
  activo: boolean | null;
}

/** CosechaUpdate (minúsculas, a diferencia de SiembraCreate). */
export interface CosechaUpdate {
  fecha_cosecha: string;
  kg_cosechados: number;
}

/** Forma real devuelta por produccion_service.registrar_cosecha (CosechaResponse no está conectado). */
export interface CosechaResponse {
  mensaje: string | null;
  resultado: Record<string, unknown> | null;
}
