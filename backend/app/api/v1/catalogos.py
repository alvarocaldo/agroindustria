from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.catalogos import OpcionCatalogoItem
from app.services import catalogos_service

router = APIRouter()


@router.get("/opciones", response_model=dict[str, list[OpcionCatalogoItem]])
def listar_opciones(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return catalogos_service.listar_opciones(db)
