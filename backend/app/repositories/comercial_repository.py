import json

from sqlalchemy import text
from sqlalchemy.orm import Session


def registrar_pedido_completo(
    db: Session,
    id_pedido: str | None,
    id_cliente: str,
    id_usuario: int,
    detalles: list[dict],
):
    query = text(
        "SELECT * FROM registrar_pedido_completo("
        ":p_id_pedido, :p_id_cliente, :p_id_usuario, CAST(:p_detalles AS jsonb)"
        ")"
    )
    result = db.execute(
        query,
        {
            "p_id_pedido": id_pedido,
            "p_id_cliente": id_cliente,
            "p_id_usuario": id_usuario,
            "p_detalles": json.dumps(detalles),
        },
    ).mappings().first()
    db.commit()
    return result
