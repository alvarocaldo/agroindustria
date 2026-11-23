from sqlalchemy import insert, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.maestros import Beneficiario, Categoria, Cliente, Lote, Producto, Programa


# (modelo ORM, columnas públicas de la entidad). La columna activo se usa sólo
# para filtrar listados; no se expone como campo de creación.
ENTIDADES = {
    "lotes": (Lote, ("id_lote", "id_fundo", "nombre_lote", "hectareas")),
    "categorias": (Categoria, ("id_categoria", "nombre_categoria")),
    "productos": (Producto, ("id_producto", "nombre_producto", "id_categoria", "precio_unit")),
    "clientes": (Cliente, ("id_cliente", "nombre_cliente", "pais")),
    "programas": (Programa, ("id_programa", "nombre_programa")),
    "beneficiarios": (
        Beneficiario,
        ("id_beneficiario", "nombre_beneficiario", "tipo_beneficiario"),
    ),
}


def _es_columna_inexistente(exc: SQLAlchemyError, nombre: str) -> bool:
    """Detecta un error de PostgreSQL por columna inexistente (SQLSTATE 42703)."""
    orig = getattr(exc, "orig", None)
    if getattr(orig, "pgcode", None) == "42703":
        return nombre in str(orig)
    mensaje = str(exc)
    return f'column "{nombre}"' in mensaje or f"column {nombre}" in mensaje


def listar_activos(db: Session, entidad: str) -> list[dict]:
    """Lista los registros activos de un maestro.

    Algunas instalaciones no tienen columna `activo` en todas las tablas; en ese
    caso se reintenta sin el filtro en lugar de devolver un error 500.
    """
    modelo, campos = ENTIDADES[entidad]
    columnas = [modelo.__table__.c[campo] for campo in campos]

    try:
        filas = db.execute(select(*columnas).where(modelo.activo.is_(True))).mappings().all()
    except SQLAlchemyError as exc:
        if not _es_columna_inexistente(exc, "activo"):
            raise
        db.rollback()
        filas = db.execute(select(*columnas)).mappings().all()

    return [dict(fila) for fila in filas]


def crear(db: Session, entidad: str, datos: dict) -> dict:
    """Inserta un maestro y recupera el ID generado por el trigger BEFORE INSERT.

    El ID no viaja en `datos`: se omite del INSERT para que PostgreSQL lo
    genere. RETURNING permite responder con el código autogenerado sin depender
    de un `refresh` por clave primaria (que aún no existe en la sesión).
    """
    modelo, _campos = ENTIDADES[entidad]
    tabla = modelo.__table__
    id_column = tabla.primary_key.columns.keys()[0]
    columnas_retorno = [tabla.c[nombre] for nombre in dict.fromkeys([*datos, id_column])]

    sentencia = insert(tabla).values(**datos).returning(*columnas_retorno)
    fila = db.execute(sentencia).mappings().first()
    db.commit()
    return dict(fila) if fila is not None else {}
