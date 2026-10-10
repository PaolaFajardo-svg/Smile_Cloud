from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.rol_schema import Rol

router = APIRouter()

@router.get("/rol")
def obtener_rol(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM rol")
     Rol = cursor.fetchall()
    return Rol