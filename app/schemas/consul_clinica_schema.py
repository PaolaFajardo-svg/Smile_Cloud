from pydantic import BaseModel
from datetime import date,time
from typing import Optional


class consul_clinica(BaseModel):
    fecha: date
    hora: time
    motivo_consulta: str
    enfermedad_actual: str
    antecedentes: str
    observaciones: str
    estado:str