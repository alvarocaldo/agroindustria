/** OpcionCatalogoItem (app/schemas/catalogos.py): { id, etiqueta }. */
export interface OpcionCatalogo {
  id: string;
  etiqueta: string;
}

/** GET /api/v1/catalogos/opciones: mapa tipo -> lista de opciones legibles. */
export type OpcionesCatalogo = Record<string, OpcionCatalogo[]>;
