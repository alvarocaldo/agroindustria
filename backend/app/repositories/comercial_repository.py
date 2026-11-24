import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session


def registrar_pedido_completo(
    db: Session,
    id_pedido: str | None,
    id_cliente: str,
    id_usuario: int,
    detalles: list[dict],
) -> dict[str, Any] | None:
    """Invoca la RPC y normaliza el objeto JSON que devuelve.

    `registrar_pedido_completo` devuelve un `json` escalar (no un `TABLE`), así
    que `SELECT *` entrega una única columna. Según el driver, ese valor llega
    como dict o como texto; aquí se unifica para que el servicio reciba siempre
    el mismo contrato.
    """
    query = text(
        "SELECT registrar_pedido_completo("
        ":p_id_pedido, :p_id_cliente, :p_id_usuario, CAST(:p_detalles AS jsonb)"
        ") AS resultado"
    )
    fila = db.execute(
        query,
        {
            "p_id_pedido": id_pedido,
            "p_id_cliente": id_cliente,
            "p_id_usuario": id_usuario,
            "p_detalles": json.dumps(detalles),
        },
    ).mappings().first()
    db.commit()

    if fila is None or fila["resultado"] is None:
        return None

    resultado = fila["resultado"]
    if isinstance(resultado, str):
        try:
            resultado = json.loads(resultado)
        except ValueError:
            return {"mensaje": resultado}

    if isinstance(resultado, dict):
        return resultado
    return {"mensaje": str(resultado)}
