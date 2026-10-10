from pathlib import Path
from fastapi import FastAPI

BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI()

from app.routes import paciente
from app.routes import consulta_clinica
from app.routes import consultorio
from app.routes import diagnostico
from app.routes import especialidad
from app.routes import examen_complementario
from app.routes import funcionario
from app.routes import odontograma
from app.routes import procedimiento
from app.routes import remision
from app.routes import rol
from app.routes import tratamiento
from app.routes import usuario
from app.routes import historial

app.include_router(paciente.router)
app.include_router(consulta_clinica.router)
app.include_router(consultorio.router)
app.include_router(diagnostico.router)
app.include_router(especialidad.router)
app.include_router(examen_complementario.router)
app.include_router(funcionario.router)
app.include_router(odontograma.router)
app.include_router(procedimiento.router)
app.include_router(remision.router)
app.include_router(rol.router)
app.include_router(tratamiento.router)
app.include_router(usuario.router)
app.include_router(historial.router)
