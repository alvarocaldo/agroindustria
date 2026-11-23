from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import maestros_repository


NOMBRES = {
    "lotes": "el lote",
    "categorias": "la categoría",
    "productos": "el producto",
    "clientes": "el cliente",
    "programas": "el programa",
    "beneficiarios": "el beneficiario",
}


def _db_error_detail(exc: Exception) -> str:
    orig = getattr(exc, "orig", None)
    return str(orig).strip() if orig is not None else str(exc)


def _error_integridad(exc: IntegrityError, entidad: str) -> HTTPException:
    nombre = NOMBRES.get(entidad, entidad)
    orig = getattr(exc, "orig", None)
    pgcode = getattr(orig, "pgcode", None)
    detalle = _db_error_detail(exc)

    if pgcode == "23505":
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe {nombre} con ese identificador o valor único: {detalle}",
        )
    if pgcode == "23503":
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No se pudo registrar {nombre}: el registro referenciado no existe. {detalle}",
        )
    if pgcode == "23502":
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Faltan campos obligatorios para registrar {nombre}: {detalle}",
        )
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Datos inválidos al registrar {nombre}: {detalle}",
    )


def listar(db: Session, entidad: str) -> list[dict]:
    try:
        return maestros_repository.listar_activos(db, entidad)
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al listar los registros de {entidad}: {_db_error_detail(exc)}",
        )


def crear(db: Session, entidad: str, datos: dict) -> dict:
    try:
        return maestros_repository.crear(db, entidad, datos)
    except IntegrityError as exc:
        db.rollback()
        raise _error_integridad(exc, entidad)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar {NOMBRES.get(entidad, entidad)}: {_db_error_detail(exc)}",
        )
