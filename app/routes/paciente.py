from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.paciente_schema import Paciente

router = APIRouter()


@router.get("/pacientes")
def obtener_pacientes(conexion=Depends(bd_conexion)):

    with conexion.cursor() as cursor:

        sql = """
        SELECT
            id_paciente,
            tipo_documento,
            numero_documento,
            nombre,
            apellido,
            fecha_nacimiento,
            sexo,
            telefono,
            correo,
            direccion,
            eps,
            estado
        FROM paciente
        WHERE estado = 'Activo'
        """

        cursor.execute(sql)
        pacientes = cursor.fetchall()
        
    return pacientes
    

@router.post("/pacientes")
def crear_paciente(datos: Paciente, conexion=Depends(bd_conexion)):

    with conexion.cursor() as cursor:

        sql = """
        INSERT INTO paciente
        (tipo_documento, numero_documento, nombre, apellido,fecha_nacimiento, sexo, telefono, correo, direccion, eps, estado)

        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(sql, (
            datos.tipo_documento,
            datos.numero_documento,
            datos.nombre,
            datos.apellido,
            datos.fecha_nacimiento,
            datos.sexo,
            datos.telefono,
            datos.correo,
            datos.direccion,
            datos.eps,
            datos.estado
        ))

    return {"mensaje": "Paciente registrado correctamente"}

@router.put("/pacientes/{id_paciente}")
def actualizar_paciente(
    id_paciente: int,
    datos: Paciente,
    conexion=Depends(bd_conexion)
):
    with conexion.cursor() as cursor:

        sql = """
        UPDATE paciente
        SET tipo_documento=%s,
            numero_documento=%s,
            nombre=%s,
            apellido=%s,
            fecha_nacimiento=%s,
            sexo=%s,
            telefono=%s,
            correo=%s,
            direccion=%s,
            eps=%s,
            estado=%s
        WHERE id_paciente=%s
        """

        cursor.execute(sql, (
            datos.tipo_documento,
            datos.numero_documento,
            datos.nombre,
            datos.apellido,
            datos.fecha_nacimiento,
            datos.sexo,
            datos.telefono,
            datos.correo,
            datos.direccion,
            datos.eps,
            datos.estado,
            id_paciente
        ))

    return {"mensaje": "Paciente actualizado correctamente"}


@router.delete("/pacientes/{id_paciente}")
def eliminar_paciente(
    id_paciente: int,
    conexion=Depends(bd_conexion)
):

    with conexion.cursor() as cursor:
        cursor.execute(
             "UPDATE paciente SET estado= %s WHERE id_paciente= %s",("inactivo",id_paciente)
        )

    return {"mensaje": "Paciente inactivado correctamente"}