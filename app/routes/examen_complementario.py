from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.examen_comple_schema import examen_comple

router = APIRouter()

@router.get("/examen_Complementario")
def obtener_examen_Complementario(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM examen_Complementario")
     examen_Complementario = cursor.fetchall()
    return examen_comple

@router.post("/examen_Complementario")
def crear_examenComplementario(datos:examen_comple, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         """INSERT INTO cita(nombre,tipo,fecha_solicitud,resultado, observaciones)
         VALUES (%s, %s, %s, %s, %s, %s, %s)""",
         (
            datos.nombre,
            datos.tipo,
            datos.fecha_solictud,
            datos.resultado,
            datos.observaciones
         )
      )
      return {"mensaje": "examen Complementario creado correctamente"}

@router.put("/examen_Complementario/{id_examen_Complementario}")
def actualizar_examenComplementario(id_examen_Complementario: int, datos: examen_comple, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE examen_Complementario
        SET nombre= %s,
        tipo= %s,
        fecha_solicitud= %s,
        resultado= %s,
        observaciones=%s""",
        (
           datos.nombre,
           datos.tipo,
           datos.fecha_solictud,
           datos.resultado,
           datos.observaciones,
           id_examen_Complementario
        )    
    )
    return {"mensaje": "examen Complementario actualizado correctamente"}

@router.delete("/examen_Complementario/{id_examen_Complementario}")
def eliminar_examen_Complementario(id_examen_Complementario: int, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         "DELETE * FROM examen_Complementario WHERE id_examen_Complementario= %s",(id_examen_Complementario,)
      )
      return {"mensaje": "examen Complementario eliminada correctamente"}

   