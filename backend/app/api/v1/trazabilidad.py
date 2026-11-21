from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_db
from app.services import trazabilidad_service

router = APIRouter()

trazabilidad_roles = RoleChecker(["ADMIN", "GERENTE", "JEFE_COMERCIAL"])


@router.get("/pedido/{id_pedido}")
def obtener_trazabilidad_pedido(
    id_pedido: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(trazabilidad_roles),
):
    return trazabilidad_service.obtener_trazabilidad(db=db, id_pedido=id_pedido)
