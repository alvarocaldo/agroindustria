from sqlalchemy import Column, Date, Integer, String

from app.database import Base


class EntregaPrograma(Base):
    __tablename__ = "entregas_programa"

    ID_Entrega = Column("id_entrega", String, primary_key=True, index=True)
    ID_Programa = Column("id_programa", String, nullable=False)
    ID_Beneficiario = Column("id_beneficiario", String, nullable=False)
    Raciones = Column("raciones", Integer, nullable=False)
    Fecha_Entrega = Column("fecha_entrega", Date, nullable=False)

