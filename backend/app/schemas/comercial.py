from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PedidoDetalleCreate(BaseModel):
    """Detalle de pedido; admite claves adicionales que espera la RPC.

    `id_detalle` es opcional: cuando no se envía (o viene vacío) se pasa como
    None a la RPC para que el trigger correspondiente genere el código.
    """

    model_config = ConfigDict(extra="allow")

    id_detalle: Optional[str] = None


class PedidoCreate(BaseModel):
    id_pedido: Optional[str] = Field(
        default=None, description="ID del pedido; vacío para autogenerarlo"
    )
    id_cliente: str = Field(..., description="ID del cliente")
    detalles: list[PedidoDetalleCreate] = Field(..., description="Lista de detalles del pedido")
