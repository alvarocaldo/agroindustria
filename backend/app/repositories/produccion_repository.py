from datetime import date

from sqlalchemy import insert, text
from sqlalchemy.orm import Session

from app.models.produccion import SiembraCosecha
from app.schemas.produccion import SiembraCreate


_MAP_RESPUESTA = {
    "id_siembra": "ID_Siembra",
    "id_lote": "ID_Lote",
    "id_variedad": "ID_Variedad",
    "id_campana": "ID_Campana",
    "fecha_siembra": "Fecha_Siembra",
    "fecha_cosecha": "Fecha_Cosecha",
    "kg_cosechados": "Kg_Cosechados",
    "activo": "activo",
}


def _id_opcional(valor) -> str | None:
    """Normaliza IDs vacíos a None para que no se incluyan en el INSERT."""
    if valor is None:
        return None
    texto = str(valor).strip()
    return texto or None


def create_siembra(db: Session, siembra_in: SiembraCreate) -> dict:
    tabla = SiembraCosecha.__table__
    datos = {
        "id_lote": siembra_in.ID_Lote,
        "id_variedad": siembra_in.ID_Variedad,
        "id_campana": siembra_in.ID_Campana,
        "fecha_siembra": siembra_in.Fecha_Siembra,
        "fecha_cosecha": siembra_in.Fecha_Cosecha,
        "kg_cosechados": siembra_in.Kg_Cosechados,
        "activo": siembra_in.activo if siembra_in.activo is not None else True,
    }

    id_siembra = _id_opcional(siembra_in.ID_Siembra)
    if id_siembra is not None:
        datos["id_siembra"] = id_siembra

    columnas_retorno = [
        tabla.c[nombre] for nombre in dict.fromkeys([*datos, "id_siembra"])
    ]
    sentencia = insert(tabla).values(**datos).returning(*columnas_retorno)
    fila = db.execute(sentencia).mappings().first()
    db.commit()
    return {_MAP_RESPUESTA[k]: v for k, v in dict(fila or {}).items() if k in _MAP_RESPUESTA}


def listar_siembras(db: Session) -> list:
    return db.query(SiembraCosecha).order_by(SiembraCosecha.Fecha_Siembra.desc()).all()


def registrar_cosecha(db: Session, id_siembra: str, fecha_cosecha: date, kg_cosechados: float):
    query = text(
        "SELECT * FROM registrar_cosecha(:p_id_siembra, :p_fecha_cosecha, :p_kg_cosechados)"
    )
    result = db.execute(
        query,
        {
            "p_id_siembra": id_siembra,
            "p_fecha_cosecha": fecha_cosecha,
            "p_kg_cosechados": kg_cosechados,
        },
    ).mappings().first()
    db.commit()
    return result
