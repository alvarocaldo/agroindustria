from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_current_user, get_db
from app.schemas.maestros import (
    BeneficiarioCreate,
    BeneficiarioResponse,
    CategoriaCreate,
    CategoriaResponse,
    ClienteCreate,
    ClienteResponse,
    LoteCreate,
    LoteResponse,
    ProductoCreate,
    ProductoResponse,
    ProgramaCreate,
    ProgramaResponse,
)
from app.services import maestros_service

router = APIRouter()

produccion_roles = RoleChecker(["ADMIN", "JEFE_PRODUCCION"])
comercial_roles = RoleChecker(["ADMIN", "JEFE_COMERCIAL"])
social_roles = RoleChecker(["ADMIN", "RESP_SOCIAL"])


# ---------------------------------------------------------------------------
# Lotes
# ---------------------------------------------------------------------------
@router.get("/lotes", response_model=list[LoteResponse])
def listar_lotes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return maestros_service.listar(db, "lotes")


@router.post("/lotes", response_model=LoteResponse, status_code=status.HTTP_201_CREATED)
def crear_lote(
    lote_in: LoteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(produccion_roles),
):
    return maestros_service.crear(db, "lotes", lote_in.model_dump())


# ---------------------------------------------------------------------------
# Categorías
# ---------------------------------------------------------------------------
@router.get("/categorias", response_model=list[CategoriaResponse])
def listar_categorias(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return maestros_service.listar(db, "categorias")


@router.post(
    "/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    categoria_in: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(comercial_roles),
):
    return maestros_service.crear(db, "categorias", categoria_in.model_dump())


# ---------------------------------------------------------------------------
# Productos
# ---------------------------------------------------------------------------
@router.get("/productos", response_model=list[ProductoResponse])
def listar_productos(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return maestros_service.listar(db, "productos")


@router.post("/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto_in: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(comercial_roles),
):
    return maestros_service.crear(db, "productos", producto_in.model_dump())


# ---------------------------------------------------------------------------
# Clientes
# ---------------------------------------------------------------------------
@router.get("/clientes", response_model=list[ClienteResponse])
def listar_clientes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return maestros_service.listar(db, "clientes")


@router.post("/clientes", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def crear_cliente(
    cliente_in: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(comercial_roles),
):
    return maestros_service.crear(db, "clientes", cliente_in.model_dump())


# ---------------------------------------------------------------------------
# Programas
# ---------------------------------------------------------------------------
@router.get("/programas", response_model=list[ProgramaResponse])
def listar_programas(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return maestros_service.listar(db, "programas")


@router.post("/programas", response_model=ProgramaResponse, status_code=status.HTTP_201_CREATED)
def crear_programa(
    programa_in: ProgramaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(social_roles),
):
    return maestros_service.crear(db, "programas", programa_in.model_dump())


# ---------------------------------------------------------------------------
# Beneficiarios
# ---------------------------------------------------------------------------
@router.get("/beneficiarios", response_model=list[BeneficiarioResponse])
def listar_beneficiarios(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return maestros_service.listar(db, "beneficiarios")


@router.post(
    "/beneficiarios",
    response_model=BeneficiarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_beneficiario(
    beneficiario_in: BeneficiarioCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(social_roles),
):
    return maestros_service.crear(db, "beneficiarios", beneficiario_in.model_dump())
