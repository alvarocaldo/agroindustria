from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import comercial_repository
from app.schemas.comercial import PedidoCreate


def _db_error_detail(exc: SQLAlchemyError) -> str:
    """Muestra el mensaje real de PostgreSQL, igual que en los otros servicios."""
    orig = getattr(exc, "orig", None)
    return str(orig).strip() if orig is not None else str(exc)


def registrar_pedido(db: Session, pedido_in: PedidoCreate, id_usuario: int):
    if not pedido_in.detalles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido debe incluir al menos un detalle",
        )

    try:
        id_usuario_int = int(id_usuario)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el usuario del token",
        )

    id_pedido = pedido_in.id_pedido.strip() if pedido_in.id_pedido else ""
    id_pedido = id_pedido or None

    detalles = []
    for detalle in pedido_in.detalles:
        item = detalle.model_dump()
        id_detalle = item.pop("id_detalle", None)
        if isinstance(id_detalle, str) and id_detalle.strip():
            item["id_detalle"] = id_detalle.strip()
        detalles.append(item)

    try:
        resultado = comercial_repository.registrar_pedido_completo(
            db=db,
            id_pedido=id_pedido,
            id_cliente=pedido_in.id_cliente,
            id_usuario=id_usuario_int,
            detalles=detalles,
        )
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar el pedido: {_db_error_detail(exc)}",
        )

    if resultado is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo registrar el pedido",
        )

    return {
        "mensaje": resultado.get("mensaje") or "Pedido registrado correctamente",
        "resultado": resultado,
    }
