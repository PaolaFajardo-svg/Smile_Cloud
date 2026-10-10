from pydantic import BaseModel

class diagnostico(BaseModel):
    codigo: str
    descripcion: str
    tipo: str
