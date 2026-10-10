from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.procedimiento_schema import procedimiento

router = APIRouter()

@router.get("/procedimiento")
def obtener_procedimiento(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM procedimiento")
     procedimiento = cursor.fetchall()
    return procedimiento

@router.post("/procedimiento")
def crear_procedimiento(datos:procedimiento, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         """INSERT INTO procedimiento(nombre, descripcion,costo)
         VALUES (%s, %s, %s)""",
         (
            datos.nombre,
            datos.descripcion,
            datos.costo
         )
      )
      return {"mensaje": "procedimiento creado correctamente"}

@router.put("/procedimiento/{id_procedimiento}")
def actualizar_procedimiento(id_procedimiento: int, datos: procedimiento, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE procedimiento
        SET nombre= %s,
        descripcion= %s,
        costo= %s""",
        (
           datos.nombre,
           datos.descripcion,
           datos.costo,
           id_procedimiento
        )    
    )
    return {"mensaje": "procedimiento actualizado correctamente"}

@router.delete("/procedimiento/{id_procedimiento}")
def eliminar_procedimiento(id_procedimiento: int, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         "DELETE * FROM procedimiento WHERE id_examen_Complementario= %s",(id_procedimiento,)
      )
      return {"mensaje": "procedimiento eliminado correctamente"}

   