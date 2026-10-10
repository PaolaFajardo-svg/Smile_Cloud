from pydantic import BaseModel
from datetime import date
from typing import Optional


class Usuario(BaseModel):
    Usuario: str
    contrasena: str
    correo: str
    estado: str
