from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, comercial, external, produccion, social, trazabilidad

app = FastAPI(title="Agroindustrial ODS2 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(produccion.router, prefix="/api/v1/produccion", tags=["Producción"])
app.include_router(comercial.router, prefix="/api/v1/comercial", tags=["Comercial"])
app.include_router(trazabilidad.router, prefix="/api/v1/trazabilidad", tags=["Trazabilidad"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Social"])
app.include_router(external.router, prefix="/api/v1/external", tags=["RENIEC"])


@app.get("/")
def read_root():
    return {"message": "Agroindustrial ODS2 API en ejecución"}
