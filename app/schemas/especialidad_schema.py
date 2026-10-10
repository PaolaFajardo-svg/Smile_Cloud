from pydantic import BaseModel
from datetime import date
from typing import Optional


class especialidad(BaseModel):
    nombre_especialidad: str
    descripcion: str