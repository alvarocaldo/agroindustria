from sqlalchemy import insert
from sqlalchemy.orm import Session

from app.models.social import EntregaPrograma
from app.schemas.social import EntregaCreate


_MAP_RESPUESTA = {
    "id_entrega": "ID_Entrega",
    "id_programa": "ID_Programa",
    "id_beneficiario": "ID_Beneficiario",
    "raciones": "Raciones",
    "fecha_entrega": "Fecha_Entrega",
}


def create_entrega(db: Session, entrega_in: EntregaCreate) -> dict:
    tabla = EntregaPrograma.__table__
    datos = {
        "id_programa": entrega_in.ID_Programa,
        "id_beneficiario": entrega_in.ID_Beneficiario,
        "raciones": entrega_in.Raciones,
        "fecha_entrega": entrega_in.Fecha_Entrega,
    }

    id_entrega = entrega_in.ID_Entrega
    if id_entrega is not None and str(id_entrega).strip():
        datos["id_entrega"] = str(id_entrega).strip()

    columnas_retorno = [
        tabla.c[nombre] for nombre in dict.fromkeys([*datos, "id_entrega"])
    ]
    sentencia = insert(tabla).values(**datos).returning(*columnas_retorno)
    fila = db.execute(sentencia).mappings().first()
    db.commit()
    return {_MAP_RESPUESTA[k]: v for k, v in dict(fila or {}).items() if k in _MAP_RESPUESTA}
