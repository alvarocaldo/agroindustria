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

    id_pedido = pedido_in.id_pedido.strip() if pedido_in.id_pedido else ""
    id_pedido = id_pedido or None

    detalles = []
    for detalle in pedido_in.detalles:
        item = detalle.model_dump()
        id_detalle = item.get("id_detalle")
        if isinstance(id_detalle, str):
            item["id_detalle"] = id_detalle.strip() or None
        detalles.append(item)

    try:
        result = comercial_repository.registrar_pedido_completo(
            db=db,
            id_pedido=id_pedido,
            id_cliente=pedido_in.id_cliente,
            id_usuario=id_usuario,
            detalles=detalles,
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
