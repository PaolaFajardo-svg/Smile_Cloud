from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.consultorio_schema import consultorio

router = APIRouter()

@router.get("/consultorio")
def obtener_consultorio(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM consultorio")
     consultorio = cursor.fetchall()
    return consultorio
