from pydantic import BaseModel
from datetime import date
from typing import Optional


class Historial(BaseModel):

    id_paciente: int
    nombre_completo: str
    numero_documento: str

    telefono: Optional[str] = None
    correo: Optional[str] = None

    id_consulta_clinica: Optional[int] = None
    fecha: Optional[date] = None

    motivo_consulta: Optional[str] = None
    enfermedad_actual: Optional[str] = None
    antecedentes: Optional[str] = None
    observaciones: Optional[str] = None

    especialista: Optional[str] = None
    diagnostico: Optional[str] = None
    tratamiento: Optional[str] = None