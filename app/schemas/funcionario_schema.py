from pydantic import BaseModel
from datetime import date
from typing import Optional


class funcionario(BaseModel):
    nombre: str
    apellido: str
    tipo_documento: str 
    numero_documento: str
    telefono: str
    correo: str
    