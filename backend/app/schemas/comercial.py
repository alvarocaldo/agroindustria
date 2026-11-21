from typing import Any

from pydantic import BaseModel, Field


class PedidoCreate(BaseModel):
    id_pedido: str = Field(..., description="ID del pedido")
    id_cliente: str = Field(..., description="ID del cliente")
    detalles: list[dict[str, Any]] = Field(..., description="Lista de detalles del pedido")


class PedidoResponse(BaseModel):
    mensaje: str | None = None
    resultado: Any = None
