from pydantic import BaseModel
from datetime import date
from typing import Optional


class odontograma(BaseModel):
    fecha: date
    observaciones: str
    