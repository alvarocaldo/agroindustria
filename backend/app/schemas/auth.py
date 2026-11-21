from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    ID_Usuario: int | None = None
    rol: str | None = None
    nombre_completo: str | None = None
