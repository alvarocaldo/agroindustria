import traceback

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.repositories import auth_repository
from app.schemas.auth import LoginRequest, Token


def login(db: Session, credentials: LoginRequest) -> Token:
    try:
        user = auth_repository.login_usuario(db, credentials.username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )

        password_hash = user.get("password_hash") or user.get("PASSWORD_HASH")
        if not password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )

        try:
            password_ok = verify_password(credentials.password, password_hash)
        except Exception as exc:
            print("Error al verificar la contraseña con passlib/bcrypt:", repr(exc))
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al verificar la contraseña: {str(exc)}",
            )

        if not password_ok:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
            )

        id_usuario = (
            user.get("id_usuario")
            or user.get("ID_Usuario")
            or user.get("ID_USUARIO")
        )
        rol = user.get("rol") or user.get("ROL")
        nombre_completo = (
            user.get("nombre_completo")
            or user.get("NOMBRE_COMPLETO")
            or user.get("nombre")
        )

        token_data = {
            "ID_Usuario": id_usuario,
            "rol": rol,
            "nombre_completo": nombre_completo,
        }
        access_token = create_access_token(data=token_data)
        return Token(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as exc:
        print("Error interno en el servicio de autenticación:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno en autenticación: {str(exc)}",
        )

