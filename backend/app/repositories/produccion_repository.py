from datetime import date

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.produccion import SiembraCosecha
from app.schemas.produccion import SiembraCreate


def create_siembra(db: Session, siembra_in: SiembraCreate) -> SiembraCosecha:
    db_obj = SiembraCosecha(
        ID_Siembra=siembra_in.ID_Siembra,
        ID_Lote=siembra_in.ID_Lote,
        ID_Variedad=siembra_in.ID_Variedad,
        ID_Campana=siembra_in.ID_Campana,
        Fecha_Siembra=siembra_in.Fecha_Siembra,
        Fecha_Cosecha=siembra_in.Fecha_Cosecha,
        Kg_Cosechados=siembra_in.Kg_Cosechados,
        activo=siembra_in.activo if siembra_in.activo is not None else True,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def listar_siembras(db: Session) -> list[SiembraCosecha]:
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
