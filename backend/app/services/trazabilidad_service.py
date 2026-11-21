from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import trazabilidad_repository


def obtener_trazabilidad(db: Session, id_pedido: str):
    try:
        rows = trazabilidad_repository.obtener_trazabilidad_pedido(db, id_pedido)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al obtener la trazabilidad del pedido",
        )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró trazabilidad para el pedido indicado",
        )

    return [dict(row) for row in rows]
