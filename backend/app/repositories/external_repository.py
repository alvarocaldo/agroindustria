import httpx

from app.core.config import settings

APIS_PERU_BASE_URL = "https://dniruc.apisperu.com"


async def consultar_dni_reniec(dni: str) -> dict | None:
    """Consulta los datos del DNI en la API externa de RENIEC (APIS Perú).

    Retorna None cuando la API indica que el DNI no existe. Los errores de
    transporte o respuesta HTTP son propagados para que la capa de servicio
    los traduzca a errores controlados.
    """
    url = f"{APIS_PERU_BASE_URL}/api/v1/dni/{dni}"
    headers = {"Authorization": f"Bearer {settings.APIS_PERU_TOKEN}"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=headers)

        if response.status_code == 404:
            return None

        response.raise_for_status()
        return response.json()
