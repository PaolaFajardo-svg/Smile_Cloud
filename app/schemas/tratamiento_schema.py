from pydantic import BaseModel
from datetime import date
from typing import Optional


class tratamiento(BaseModel):
    nombre: str
    descripcion: str
    fecha_inicio: date
    fecha_fin: date
    estado: str
    