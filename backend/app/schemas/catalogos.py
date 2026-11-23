from pydantic import BaseModel


class OpcionCatalogoItem(BaseModel):
    """Una opción devuelta por la vista vw_opciones_catalogo."""

    id: str
    etiqueta: str
