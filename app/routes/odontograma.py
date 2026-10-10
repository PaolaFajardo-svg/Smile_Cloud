from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.odontograma_schema import odontograma

router = APIRouter()

@router.get("/odontograma")
def obtener_odontograma(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM odontograma")
     odontograma = cursor.fetchall()
    return odontograma

@router.put("/odontograma/{id_odontograma}")
def actualizar_odongrama(id_odontograma: int, datos: odontograma, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE odontograma
        SET fecha= %s,
        WHERE id_odontograma= %s""",
        (
           datos.fecha,
           id_odontograma
        )    
    )
    return {"mensaje": "odontograma actualizado correctamente"}
