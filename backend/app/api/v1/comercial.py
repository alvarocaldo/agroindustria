from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_db
from app.schemas.comercial import PedidoCreate
from app.services import comercial_service

router = APIRouter()

comercial_roles = RoleChecker(["ADMIN", "JEFE_COMERCIAL"])


@router.post("/pedidos", status_code=status.HTTP_201_CREATED)
def registrar_pedido(
    pedido_in: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(comercial_roles),
):
    return comercial_service.registrar_pedido(
        db=db,
        pedido_in=pedido_in,
        id_usuario=current_user["ID_Usuario"],
    )
