import traceback

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import produccion_repository
from app.schemas.produccion import CosechaUpdate, SiembraCreate


def _db_error_detail(exc: Exception) -> str:
    orig = getattr(exc, "orig", None)
    if orig is not None:
        return str(orig)
    return str(exc)


def create_siembra(db: Session, siembra_in: SiembraCreate):
    try:
        return produccion_repository.create_siembra(db, siembra_in)
    except IntegrityError as exc:
        db.rollback()
        print("Error de integridad al registrar siembra:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La siembra ya existe o los datos referenciados no son válidos: {_db_error_detail(exc)}",
        )
    except SQLAlchemyError as exc:
        db.rollback()
        print("Error de base de datos al registrar siembra:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar la siembra: {_db_error_detail(exc)}",
        )
    except Exception as exc:
        db.rollback()
        print("Error inesperado al registrar siembra:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al registrar la siembra: {str(exc)}",
        )


def listar_siembras(db: Session):
    try:
        return produccion_repository.listar_siembras(db)
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al listar las siembras: {_db_error_detail(exc)}",
        )


def registrar_cosecha(db: Session, id_siembra: str, cosecha_in: CosechaUpdate):
    try:
        result = produccion_repository.registrar_cosecha(
            db=db,
            id_siembra=id_siembra,
            fecha_cosecha=cosecha_in.fecha_cosecha,
            kg_cosechados=cosecha_in.kg_cosechados,
        )
    except SQLAlchemyError as exc:
        db.rollback()
        print("Error de base de datos al registrar cosecha:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar la cosecha: {_db_error_detail(exc)}",
        )
    except Exception as exc:
        db.rollback()
        print("Error inesperado al registrar cosecha:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al registrar la cosecha: {str(exc)}",
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Siembra no encontrada",
        )

    return {"mensaje": "Cosecha registrada correctamente", "resultado": dict(result)}

