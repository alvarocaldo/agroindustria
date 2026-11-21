from fastapi import APIRouter, Depends

from app.api.deps import RoleChecker
from app.services import external_service

router = APIRouter()

external_roles = RoleChecker(["ADMIN", "RESP_SOCIAL"])


@router.get("/dni/{dni}")
async def consultar_dni(
    dni: str,
    current_user: dict = Depends(external_roles),
):
    return await external_service.consultar_dni(dni)
