from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.especialidad_schema import especialidad

router = APIRouter()

@router.get("/especialidad")
def obtener_especialidad(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM especialidad")
        especialidad = cursor.fetchall()
    return especialidad

@router.delete("/especialidad/{id_especialidad}")
def inactivar_especialidad(id_especialidad: int, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         "UPDATE especialidad SET estado= %s WHERE id_especialidad= %s",("inactivo",id_especialidad)
      )
      return {"mensaje": "especialidad inactivada correctamente"}
