/** EntregaCreate (app/schemas/social.py). */
export interface EntregaCreate {
  ID_Entrega: string;
  ID_Programa: string;
  ID_Beneficiario: string;
  Raciones: number;
  Fecha_Entrega: string;
}

/** EntregaResponse: mismos 5 campos que EntregaCreate (from_attributes=True). */
export interface EntregaResponse {
  ID_Entrega: string;
  ID_Programa: string;
  ID_Beneficiario: string;
  Raciones: number;
  Fecha_Entrega: string;
}
