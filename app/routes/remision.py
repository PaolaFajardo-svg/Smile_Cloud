from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.remision_schema import remision

router = APIRouter()

@router.get("/remision")
def obtener_remision(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM remision")
     remision = cursor.fetchall()
    return remision

@router.post("/remision")
def crear_remision(datos:remision, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         """INSERT INTO remision(fecha, motivo,entidad_destino,observaciones)
         VALUES (%s, %s, %s, %s)""",
         (
            datos.fecha,
            datos.motivo,
            datos.entidad_destino,
            datos.observaciones,
         )
      )
      return {"mensaje": "remision creada correctamente"}

@router.put("/remision/{id_remision}")
def actualizar_remision(id_remision: int, datos: remision, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE remision
        SET fecha= %s,
        motivo= %s,
        entidad_destino= %s
        observaciones= %s""",
        (
           datos.fecha,
           datos.motivo,
           datos.entidad_destino,
           datos.observaciones,
           id_remision
        )    
    )
    return {"mensaje": "remision actualizado correctamente"}

@router.delete("/remision/{id_remision}")
def eliminar_remision(id_remision: int, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         "DELETE * FROM remision WHERE id_remision= %s",(id_remision,)
      )
      return {"mensaje": "remision eliminada correctamente"}

   