from pydantic import BaseModel
from datetime import date
from typing import Optional


class examen_comple(BaseModel):
    nombre: str
    tipo: str
    fecha_solictud: date
    resultado: str
    observaciones: str
    