from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import comercial_repository
from app.schemas.comercial import PedidoCreate


def registrar_pedido(db: Session, pedido_in: PedidoCreate, id_usuario: int):
    if not pedido_in.detalles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido debe incluir al menos un detalle",
        )
    try:
        result = comercial_repository.registrar_pedido_completo(
            db=db,
            id_pedido=pedido_in.id_pedido,
            id_cliente=pedido_in.id_cliente,
            id_usuario=id_usuario,
            detalles=pedido_in.detalles,
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al registrar el pedido",
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo registrar el pedido",
        )

    return {"mensaje": "Pedido registrado correctamente", "resultado": dict(result)}
