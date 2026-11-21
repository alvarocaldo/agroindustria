from datetime import date

from pydantic import BaseModel, ConfigDict


class EntregaCreate(BaseModel):
    ID_Entrega: str
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
