from pydantic import BaseModel

class diente(BaseModel):
    id_diente:int 
    nombre_diente:str
    numero_diente:int 
    imagen: str