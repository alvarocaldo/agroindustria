from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_db
from app.schemas.produccion import CosechaUpdate, SiembraCreate, SiembraResponse
from app.services import produccion_service

router = APIRouter()

produccion_roles = RoleChecker(["ADMIN", "JEFE_PRODUCCION"])


@router.get("/siembras", response_model=list[SiembraResponse])
def listar_siembras(
    db: Session = Depends(get_db),
    current_user: dict = Depends(produccion_roles),
):
    return produccion_service.listar_siembras(db=db)


@router.post("/siembras", response_model=SiembraResponse, status_code=status.HTTP_201_CREATED)
def create_siembra(
    siembra_in: SiembraCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(produccion_roles),
):
    return produccion_service.create_siembra(db=db, siembra_in=siembra_in)


@router.patch("/siembras/{id_siembra}/cosecha")
def registrar_cosecha(
    id_siembra: str,
    cosecha_in: CosechaUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(produccion_roles),
):
    return produccion_service.registrar_cosecha(
        db=db, id_siembra=id_siembra, cosecha_in=cosecha_in
    )
