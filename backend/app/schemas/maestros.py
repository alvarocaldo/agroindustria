from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class LoteCreate(BaseModel):
    id_fundo: str = Field(..., min_length=1, description="ID del fundo al que pertenece el lote")
    nombre_lote: str = Field(..., min_length=1, description="Nombre del lote")
    hectareas: Decimal = Field(..., gt=0, description="Área del lote en hectáreas")


class LoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_lote: str
    id_fundo: str
    nombre_lote: str
    hectareas: Decimal


class CategoriaCreate(BaseModel):
    nombre_categoria: str = Field(..., min_length=1, description="Nombre de la categoría")


class CategoriaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_categoria: str
    nombre_categoria: str


class ProductoCreate(BaseModel):
    nombre_producto: str = Field(..., min_length=1, description="Nombre del producto")
    id_categoria: str = Field(..., min_length=1, description="ID de la categoría")
    precio_unit: Decimal = Field(..., ge=0, description="Precio unitario del producto")


class ProductoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_producto: str
    nombre_producto: str
    id_categoria: str
    precio_unit: Decimal


class ClienteCreate(BaseModel):
    nombre_cliente: str = Field(..., min_length=1, description="Nombre del cliente")
    pais: str = Field(..., min_length=1, description="País del cliente")


class ClienteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_cliente: str
    nombre_cliente: str
    pais: str


class ProgramaCreate(BaseModel):
    nombre_programa: str = Field(..., min_length=1, description="Nombre del programa social")


class ProgramaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_programa: str
    nombre_programa: str


class BeneficiarioCreate(BaseModel):
    nombre_beneficiario: str = Field(..., min_length=1, description="Nombre del beneficiario")
    tipo_beneficiario: str = Field(..., min_length=1, description="Tipo de beneficiario")


class BeneficiarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_beneficiario: str
    nombre_beneficiario: str
    tipo_beneficiario: str
