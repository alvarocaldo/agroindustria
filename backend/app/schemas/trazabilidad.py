from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class TrazabilidadItem(BaseModel):
    producto: Optional[str] = None
    cantidad: Optional[Decimal | float | int] = None
    fundo: Optional[str] = None
    lote: Optional[str] = None
    fecha_siembra: Optional[date] = None
