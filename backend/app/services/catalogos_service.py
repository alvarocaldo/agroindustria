from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import catalogos_repository


def _db_error_detail(exc: Exception) -> str:
    orig = getattr(exc, "orig", None)
    return str(orig) if orig is not None else str(exc)


def listar_opciones(db: Session) -> dict[str, list[dict]]:
    try:
        filas = catalogos_repository.listar_opciones(db)
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al listar las opciones de catálogos: {_db_error_detail(exc)}",
        )

    opciones: dict[str, list[dict]] = {}
    for fila in filas:
        tipo = fila.get("tipo")
        if tipo is None:
            continue
        opciones.setdefault(str(tipo), []).append(
            {
                "id": str(fila["id"]) if fila.get("id") is not None else "",
                "etiqueta": str(fila.get("etiqueta") or ""),
            }
        )
    return opciones
