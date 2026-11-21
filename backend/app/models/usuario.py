from sqlalchemy import Boolean, Column, Integer, String

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    ID_Usuario = Column("id_usuario", Integer, primary_key=True, index=True)
    username = Column("username", String, unique=True, index=True, nullable=False)
    password_hash = Column("password_hash", String, nullable=False)
    nombre_completo = Column("nombre_completo", String, nullable=True)
    rol = Column("rol", String, nullable=False)
    activo = Column("activo", Boolean, default=True)

