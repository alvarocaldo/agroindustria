from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("ID_Usuario")
        rol = payload.get("rol")
        if user_id is None or rol is None:
            raise credentials_exception
        return {
            "ID_Usuario": user_id,
            "rol": rol,
            "nombre_completo": payload.get("nombre_completo"),
        }
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (InvalidTokenError, Exception):
        raise credentials_exception


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        if current_user.get("rol") not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para acceder a este recurso",
            )
        return current_user
