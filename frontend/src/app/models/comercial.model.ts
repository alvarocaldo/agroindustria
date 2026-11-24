/** PedidoCreate.detalles son los objetos que consume jsonb_to_recordset en la RPC. */
export type PedidoDetalle = Record<string, unknown>;

/** PedidoCreate (app/schemas/comercial.py). id_usuario se toma del JWT, no del body. */
export interface PedidoCreate {
  /** Vacío/null => la RPC autogenera el código (`PED001`...). */
  id_pedido?: string | null;
  id_cliente: string;
  detalles: PedidoDetalle[];
}

/** json_build_object devuelto por public.registrar_pedido_completo. */
export interface PedidoResultado {
  success: boolean;
  id_pedido: string;
  mensaje: string;
}

/** Forma devuelta por comercial_service.registrar_pedido. */
export interface PedidoResponse {
  mensaje: string;
  resultado: PedidoResultado;
}
