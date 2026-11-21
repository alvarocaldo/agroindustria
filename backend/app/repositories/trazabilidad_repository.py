from sqlalchemy import text
from sqlalchemy.orm import Session


def obtener_trazabilidad_pedido(db: Session, id_pedido: str):
    query = text(
        "SELECT * FROM obtener_trazabilidad_pedido(:p_id_pedido)"
    )
    result = db.execute(query, {"p_id_pedido": id_pedido}).mappings().all()
    return result
