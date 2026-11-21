import re

import httpx
from fastapi import HTTPException, status

from app.repositories import external_repository


async def consultar_dni(dni: str) -> dict:
    if not re.fullmatch(r"[0-9]{8}", dni):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DNI debe tener 8 dígitos",
        )

    try:
        datos = await external_repository.consultar_dni_reniec(dni)
    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se pudo consultar el servicio de RENIEC. Intente nuevamente más tarde.",
        )

    if datos is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el DNI indicado en RENIEC",
        )

    return datos
