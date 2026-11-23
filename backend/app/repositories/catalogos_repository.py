from sqlalchemy import text
from sqlalchemy.orm import Session


def listar_opciones(db: Session) -> list[dict]:
    """Devuelve las filas de la vista de opciones, ordenadas por tipo e id."""
    query = text(
        "SELECT tipo, id, etiqueta FROM vw_opciones_catalogo ORDER BY tipo, id"
    )
    return [dict(fila) for fila in db.execute(query).mappings().all()]
