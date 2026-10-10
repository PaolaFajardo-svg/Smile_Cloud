from pydantic import BaseModel
from datetime import date
from typing import Optional


class Rol(BaseModel):
    nombre: str
    descripcion: str
