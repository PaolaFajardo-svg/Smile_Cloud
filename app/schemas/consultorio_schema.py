from pydantic import BaseModel
from datetime import date
from typing import Optional


class consultorio(BaseModel):
    nombre_consultorio: str
    ubicacion: str
    estado: str
    