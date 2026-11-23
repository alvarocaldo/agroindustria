from sqlalchemy import Boolean, Column, Numeric, String

from app.database import Base


class Lote(Base):
    __tablename__ = "lotes"

    id_lote = Column("id_lote", String, primary_key=True, index=True)
    id_fundo = Column("id_fundo", String, nullable=False)
    nombre_lote = Column("nombre_lote", String, nullable=False)
    hectareas = Column("hectareas", Numeric, nullable=False)
    activo = Column("activo", Boolean, default=True)


class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column("id_categoria", String, primary_key=True, index=True)
    nombre_categoria = Column("nombre_categoria", String, nullable=False)
    activo = Column("activo", Boolean, default=True)


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column("id_producto", String, primary_key=True, index=True)
    nombre_producto = Column("nombre_producto", String, nullable=False)
    id_categoria = Column("id_categoria", String, nullable=False)
    precio_unit = Column("precio_unit", Numeric, nullable=False)
    activo = Column("activo", Boolean, default=True)


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column("id_cliente", String, primary_key=True, index=True)
    nombre_cliente = Column("nombre_cliente", String, nullable=False)
    pais = Column("pais", String, nullable=False)
    activo = Column("activo", Boolean, default=True)


class Programa(Base):
    __tablename__ = "programas"

    id_programa = Column("id_programa", String, primary_key=True, index=True)
    nombre_programa = Column("nombre_programa", String, nullable=False)
    activo = Column("activo", Boolean, default=True)


class Beneficiario(Base):
    __tablename__ = "beneficiarios"

    id_beneficiario = Column("id_beneficiario", String, primary_key=True, index=True)
    nombre_beneficiario = Column("nombre_beneficiario", String, nullable=False)
    tipo_beneficiario = Column("tipo_beneficiario", String, nullable=False)
    activo = Column("activo", Boolean, default=True)
