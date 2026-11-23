from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EntregaCreate(BaseModel):
    # Vacío/None => el trigger BEFORE INSERT genera el código de la entrega.
    ID_Entrega: Optional[str] = None
    ID_Programa: str
    ID_Beneficiario: str
    Raciones: int
    Fecha_Entrega: date


class EntregaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ID_Entrega: str
    ID_Programa: str
    ID_Beneficiario: str
    Raciones: int
    Fecha_Entrega: date
