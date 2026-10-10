from pydantic import BaseModel
from datetime import date



class Paciente(BaseModel):
    tipo_documento: str
    numero_documento: str
    nombre: str
    apellido: str
    fecha_nacimiento: date
    sexo: str
    telefono: str
    correo: str
    direccion: str
    eps: str
    estado: str