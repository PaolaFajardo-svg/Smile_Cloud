from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.diagnostico_schema import diagnostico

router = APIRouter()

@router.get("/diagnostico")
def obtener_diagnostico(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM diagnostico")
     diagnostico = cursor.fetchall()
    return diagnostico

@router.post("/diagnostico")
def crear_diagnostico(datos:diagnostico, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         """INSERT INTO diagnotico(codigo, descripcion,tipo)
         VALUES (%s, %s, %s)""",
         (
            datos.codigo,
            datos.descripcion,
            datos.tipo,
         
         )
      )
      return {"mensaje": "diagnostico creado correctamente"}

@router.put("/diagnostico/{id_diagnostico}")
def actualizar_Diagnostico(id_diagnostico: int, datos: diagnostico, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE diagnostico
        SET codigo=%s,
        descripcion=%s,
        tipo=%s,
        WHERE id_diagnostico= %s""",
        (
           datos.codigo,
           datos.descripcion,
           datos.tipo,
           id_diagnostico
        )    
    )
    return {"mensaje": "Diagnostico actualizada correctamente"}


   