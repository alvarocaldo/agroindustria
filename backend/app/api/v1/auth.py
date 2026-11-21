import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.auth import LoginRequest, Token
from app.services import auth_service

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        credentials = LoginRequest(
            username=form_data.username,
            password=form_data.password,
        )
        return auth_service.login(db=db, credentials=credentials)
    except HTTPException:
        raise
    except Exception as exc:
        print("Error interno en endpoint /auth/login:", repr(exc))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno en login: {str(exc)}",
        )


