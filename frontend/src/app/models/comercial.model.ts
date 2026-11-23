/** PedidoCreate.detalles es list[dict[str, Any]]: el backend NO define las claves de cada detalle. */
export type PedidoDetalle = Record<string, unknown>;

/** PedidoCreate (app/schemas/comercial.py). id_usuario se toma del JWT, no del body. */
export interface PedidoCreate {
  /** Vacío/null => el RPC autogenera el código. */
  id_pedido?: string | null;
  id_cliente: string;
  detalles: PedidoDetalle[];
}

/** Forma real devuelta por comercial_service.registrar_pedido. */
export interface PedidoResponse {
  mensaje: string | null;
  resultado: unknown;
}
