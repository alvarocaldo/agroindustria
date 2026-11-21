from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories import social_repository
from app.schemas.social import EntregaCreate


def create_entrega(db: Session, entrega_in: EntregaCreate):
    try:
        return social_repository.create_entrega(db, entrega_in)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La entrega ya existe o los datos referenciados no son válidos",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al registrar la entrega",
        )
