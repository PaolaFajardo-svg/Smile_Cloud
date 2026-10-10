from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.funcionario_schema import funcionario

router = APIRouter()

@router.get("/funcionario")
def obtener_funcionario(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
     cursor.execute("SELECT * FROM funcionario")
     funcionario = cursor.fetchall()
    return funcionario

@router.post("/funcionario")
def crear_funcionario(datos:funcionario, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         """INSERT INTO funcionario(nombre, apellido, tipo_documento, numero_documento, telefono, correo)
         VALUES (%s, %s, %s, %s, %s, %s)""",
         (
           datos.nombre,
           datos.apellido, 
           datos.tipo_documento,
           datos.numero_documento,
           datos.telefono,
           datos.correo
         )
      )
      return {"mensaje": "cita creada correctamente"}

@router.put("/funcionario/{id_funcionario}")
def actualizar_funcionario(id_funcionario: int, datos: funcionario, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE funcionario
        SET nombre= %s,
        apellido= %s,
        tipo_documento= %s,
        numero_documento= %s,
        telefono= %s,
        correo= %s,
        WHERE id_funcionario= %s""",
        (
           datos.nombre,
           datos.apellido,
           datos.tipo_documento,
           datos.numero_documento,
           datos.telefono,
           datos.correo,
           id_funcionario
        )    
    )
    return {"mensaje": "Funcionario actualizado correctamente"}

@router.delete("/funcionario/{id_funcionario}")
def eliminar_funcionario(id_funcionario: int, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         "DELETE * FROM cita WHERE id_funcionario= %s",(id_funcionario,)
      )
      return {"mensaje": "cita eliminada correctamente"}
