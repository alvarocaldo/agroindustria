from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SiembraCreate(BaseModel):
    # Vacío/None => el trigger BEFORE INSERT genera el código de la siembra.
    ID_Siembra: Optional[str] = None
    ID_Lote: str
    ID_Variedad: str
    ID_Campana: str
    Fecha_Siembra: date
    Fecha_Cosecha: Optional[date] = None
    Kg_Cosechados: Optional[Decimal] = None
    activo: Optional[bool] = True


class SiembraResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ID_Siembra: str
    ID_Lote: str
    ID_Variedad: str
    ID_Campana: str
    Fecha_Siembra: date
    Fecha_Cosecha: Optional[date] = None
    Kg_Cosechados: Optional[Decimal] = None
    activo: Optional[bool] = True


class CosechaUpdate(BaseModel):
    fecha_cosecha: date
    kg_cosechados: float


class CosechaResponse(BaseModel):
    mensaje: str | None = None
    resultado: dict | None = None
