/** Datos de RENIEC devueltos por GET /api/v1/external/dni/{dni} (API PERÚ). */
export interface DniResponse {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}
