from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_db
from app.schemas.social import EntregaCreate, EntregaResponse
from app.services import social_service

router = APIRouter()

social_roles = RoleChecker(["ADMIN", "RESP_SOCIAL"])


@router.post("/entregas", response_model=EntregaResponse, status_code=status.HTTP_201_CREATED)
def create_entrega(
    entrega_in: EntregaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(social_roles),
):
    return social_service.create_entrega(db=db, entrega_in=entrega_in)
