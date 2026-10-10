from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.usuario_schema import Usuario

router = APIRouter()

@router.get("/usuario")
def obtener_Usuario(conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM Usuario")
        Usuario = cursor.fetchall()
    return Usuario


@router.post("/Usuario")
def crear_Usuario(datos: Usuario, conexion=Depends(bd_conexion)):

    with conexion.cursor() as cursor:

        sql = """
        INSERT INTO Usuario
        (usuario,contrasena,correo,estado)

        VALUES (%s,%s,%s,%s)
        """
        cursor.execute(sql, (
            datos.Usuario,
            datos.contrasena,
            datos.correo,
            datos.estado
        ))

    return {"mensaje": "Usuario registrado correctamente"}

@router.put("/usuario/{id_usuario}")
def actualizarUsuario(id_usuario:int, datos:Usuario, conexion=Depends(bd_conexion)
):
   with conexion.cursor() as cursor:
    cursor.execute(
      """ UPDATE consulta_clinica
        SET usuario= %s,
        contrasena= %s,
        correo= %s,
        estado= %s,
       """,
        (
           datos.Usuario,
           datos.contrasena,
           datos.correo,
           datos.estado,
           id_usuario
        )    
    )
    return {"mensaje": "datos de usuario actualizados correctamente"}


@router.delete("/usuario/{id_usuario}")
def inactivar_usuario(id_usuario: int, conexion=Depends(bd_conexion)):
   with conexion.cursor() as cursor:
      cursor.execute(
         "UPDATE usuario SET estado= %s WHERE id_usuario= %s",("inactivo",id_usuario)
      )
      return {"mensaje": "usuario inactivado correctamente"}
