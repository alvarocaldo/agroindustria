from sqlalchemy.orm import Session

from app.models.social import EntregaPrograma
from app.schemas.social import EntregaCreate


def create_entrega(db: Session, entrega_in: EntregaCreate) -> EntregaPrograma:
    db_obj = EntregaPrograma(
        ID_Entrega=entrega_in.ID_Entrega,
        ID_Programa=entrega_in.ID_Programa,
        ID_Beneficiario=entrega_in.ID_Beneficiario,
        Raciones=entrega_in.Raciones,
        Fecha_Entrega=entrega_in.Fecha_Entrega,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
