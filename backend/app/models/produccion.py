from sqlalchemy import Boolean, Column, Date, Numeric, String

from app.database import Base


class SiembraCosecha(Base):
    __tablename__ = "siembras_cosechas"

    ID_Siembra = Column("id_siembra", String, primary_key=True, index=True)
    ID_Lote = Column("id_lote", String, nullable=False)
    ID_Variedad = Column("id_variedad", String, nullable=False)
    ID_Campana = Column("id_campana", String, nullable=False)
    Fecha_Siembra = Column("fecha_siembra", Date, nullable=False)
    Fecha_Cosecha = Column("fecha_cosecha", Date, nullable=True)
    Kg_Cosechados = Column("kg_cosechados", Numeric, nullable=True)
    activo = Column("activo", Boolean, default=True)

