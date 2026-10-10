from pydantic import BaseModel
from datetime import date
from typing import Optional


class remision(BaseModel):
    fecha: date
    motivo: str
    entidad_destino: str
    observaciones: str
    