from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import (
    auth,
    catalogos,
    comercial,
    external,
    maestros,
    produccion,
    social,
    trazabilidad,
)

app = FastAPI(title="Agroindustrial ODS2 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Devuelve el detalle real del error 500 con cabecera CORS explícita.

    Starlette coloca su ServerErrorMiddleware por fuera del CORSMiddleware, por
    lo que un 500 no lleva las cabeceras CORS del middleware y el navegador lo
    muestra como fallo de CORS en lugar del error real.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )


app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(produccion.router, prefix="/api/v1/produccion", tags=["Producción"])
app.include_router(comercial.router, prefix="/api/v1/comercial", tags=["Comercial"])
app.include_router(trazabilidad.router, prefix="/api/v1/trazabilidad", tags=["Trazabilidad"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Social"])
app.include_router(external.router, prefix="/api/v1/external", tags=["RENIEC"])
app.include_router(catalogos.router, prefix="/api/v1/catalogos", tags=["Catálogos"])
app.include_router(maestros.router, prefix="/api/v1/maestros", tags=["Maestros"])


@app.get("/")
def read_root():
    return {"message": "Agroindustrial ODS2 API en ejecución"}
