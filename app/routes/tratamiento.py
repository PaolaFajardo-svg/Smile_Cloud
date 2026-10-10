from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.tratamiento_schema import tratamiento

router = APIRouter()

@router.get("/tratamiento")
def obtener_tratamiendo(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM tratamiento")
        tratamiento = cursor.fetchall()
    return  tratamiento


@router.post("/tratamiento")
def crear_tratamiento(datos:tratamiento, conexion=Depends(bd_conexion)):

    with conexion.cursor() as cursor:

        sql = """
        INSERT INTO tratamiento
        (nombre,descripcion,fecha_inicio,fecha_fin,estado)

        VALUES (%s,%s,%s,%s,%s)
        """
        cursor.execute(sql, (
            datos.nombre,
            datos.descripcion,
            datos.fecha_inicio,
            datos.fecha_fin,
            datos.estado
        ))

    return {"mensaje": "Tratamiento registrado correctamente"}

@router.put("/tratamiento/{id_tratamiento}")
def actualizarUsuario(id_tratamiento:int, datos:tratamiento, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE tratamiento
        SET nombre= %s,
        descripcion= %s,
        fecha_inicio= %s,
        fecha_fin= %s,
        estado= %s,
       """,
        (
           datos.nombre,
           datos.descripcion,
           datos.fecha_inicio,
           datos.estado,
           id_tratamiento
        )    
    )
    return {"mensaje": "datos de tratamiento actualizados correctamente"}


router.delete("/tratamiento/{id_tratamiento}")
def eliminar_tratamiento(id_tratamiento: int, conexion=Depends(bd_conexion)
):      
    with conexion.cursor() as cursor:
        cursor.execute(
            "DELETE FROM tratamiento WHERE id_tratamiento = %s",
            (id_tratamiento,)
        )
    return {"mensaje": "tratamiento eliminado correctamente"}
