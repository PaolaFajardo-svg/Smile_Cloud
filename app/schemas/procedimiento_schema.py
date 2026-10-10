from pydantic import BaseModel
from datetime import date
from typing import Optional


class procedimiento(BaseModel):
    nombre: str
    descripcion: str
    costo: float
    