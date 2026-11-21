/**
 * GET /api/v1/trazabilidad/pedido/{id_pedido} devuelve directamente una lista de
 * filas del RPC `obtener_trazabilidad_pedido`, sin response_model conectado.
 * El schema TrazabilidadItem existe en el backend pero NO se usa: no asumir sus claves.
 */
export type TrazabilidadFila = Record<string, unknown>;
