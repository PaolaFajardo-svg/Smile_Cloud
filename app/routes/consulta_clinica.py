from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, date, time
from app.database import bd_conexion
from app.schemas.consul_clinica_schema import consul_clinica

router = APIRouter()

@router.get("/consulta_clinica")
def obtener_citas(fecha: str = None, conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:

        sql = """
        SELECT
            cc.id_consulta_clinica,
            c.id_cita,
            c.fecha,
            LEFT(c.hora, 5) AS hora,
            CONCAT(p.nombre, ' ', p.apellido) AS paciente,
            CONCAT(f.nombre, ' ', f.apellido) AS especialista,
            co.nombre AS consultorio,
            c.estado,
            c.motivo
        FROM consulta_clinica cc
        INNER JOIN cita c
            ON c.id_cita = cc.id_cita
        INNER JOIN paciente p
            ON p.id_paciente = c.id_paciente
        INNER JOIN funcionario f
            ON f.id_funcionario = c.id_funcionario
        INNER JOIN consultorio co
            ON co.id_consultorio = c.id_consultorio
        """
        if fecha:
            sql += " WHERE c.fecha = %s"
            cursor.execute(sql, (fecha,))
        else:
            cursor.execute(sql)
        citas = cursor.fetchall()
    return citas

@router.post("/citas")
def crear_cita(datos: dict, conexion=Depends(bd_conexion)):
    fecha = datos.get("fecha")
    hora = datos.get("hora")
    motivo = datos.get("motivo")
    id_paciente = datos.get("id_paciente")
    id_funcionario = datos.get("id_funcionario")
    id_consultorio = datos.get("id_consultorio")

    if not all([fecha, hora, motivo, id_paciente, id_funcionario, id_consultorio]):
        raise HTTPException(status_code=400, detail="Completa todos los campos de la cita.")

    with conexion.cursor() as cursor:
        # Evitar reservar el mismo horario para el mismo especialista.
        cursor.execute(
            """SELECT id_cita FROM cita
               WHERE fecha=%s AND hora=%s AND id_funcionario=%s
               AND estado IN ('Pendiente','Programada','Confirmada')""",
            (fecha, hora, id_funcionario)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="El especialista ya tiene una cita en esa fecha y hora.")

        cursor.execute(
            """INSERT INTO cita (fecha, hora, estado, motivo, id_paciente, id_funcionario, id_consultorio)
               VALUES (%s, %s, 'Pendiente', %s, %s, %s, %s)""",
            (fecha, hora, motivo, id_paciente, id_funcionario, id_consultorio)
        )
        id_cita = cursor.lastrowid
        cursor.execute(
            """INSERT INTO consulta_clinica
               (fecha, motivo_consulta, enfermedad_actual, antecedentes, observaciones,
                id_paciente, id_funcionario, id_cita)
               VALUES (%s, %s, '', '', '', %s, %s, %s)""",
            (f"{fecha} {hora}", motivo, id_paciente, id_funcionario, id_cita)
        )
    return {"mensaje": "Cita creada correctamente", "id_cita": id_cita}

@router.put("/consulta_clinica/{id_consulta_clinica}/reagendar")
def reagendar_cita(id_consulta_clinica: int, fecha: date, hora: time, conexion=Depends(bd_conexion)
):
    with conexion.cursor() as cursor:
        # Buscar la cita que se quiere reagendar
        cursor.execute(
            """
            SELECT
                c.id_cita,
                c.estado,
                cc.id_funcionario
            FROM consulta_clinica cc
            INNER JOIN cita c
                ON c.id_cita = cc.id_cita
            WHERE cc.id_consulta_clinica = %s
            """,
            (id_consulta_clinica,)
        )

        cita_actual = cursor.fetchone()

        if not cita_actual:
            raise HTTPException(
                status_code=404,
                detail="La cita no existe"
            )

        # No permitir reagendar citas canceladas o finalizadas
        if cita_actual["estado"] in ["Cancelada", "Finalizada"]:
            raise HTTPException(
                status_code=400,
                detail="No se puede reagendar una cita cancelada o finalizada"
            )

        # No permitir fechas anteriores a hoy
        hoy = date.today()

        if fecha < hoy:
            raise HTTPException(
                status_code=400,
                detail="No se puede reagendar una cita para una fecha anterior"
            )

        # Si la cita es para hoy, la hora debe ser futura
        ahora = datetime.now()

        if fecha == hoy and hora <= ahora.time():
            raise HTTPException(
                status_code=400,
                detail="La hora seleccionada ya pasó"
            )

        # Verificar que el odontólogo no tenga otra cita
        # activa en la misma fecha y hora
        cursor.execute(
            """
            SELECT cc.id_consulta_clinica
            FROM consulta_clinica cc

            INNER JOIN cita c
                ON c.id_cita = cc.id_cita

            WHERE cc.id_funcionario = %s
              AND c.fecha = %s
              AND c.hora = %s
              AND c.estado IN ('Programada', 'Confirmada')
              AND cc.id_consulta_clinica != %s
            """,
            (
                cita_actual["id_funcionario"],
                fecha,
                hora,
                id_consulta_clinica
            )
        )
  
        horario_ocupado = cursor.fetchone()

        if horario_ocupado: 
            raise HTTPException(
                status_code=400,
                detail="El odontólogo ya tiene una cita programada en esa fecha y hora"
            )
        # Reagendar
        cursor.execute(
            """
            UPDATE cita c

            INNER JOIN consulta_clinica cc
                ON cc.id_cita = c.id_cita

            SET c.fecha = %s,
                c.hora = %s,
                c.estado = %s

            WHERE cc.id_consulta_clinica = %s
            """,
            (
                fecha,
                hora,
                "Programada",
                id_consulta_clinica
            )
        )
    return {
        "mensaje": "Cita reagendada correctamente"
    }


@router.put("/consulta_clinica/{id_consulta_clinica}/confirmar")
def confirmar_cita(id_consulta_clinica: int, conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
        cursor.execute(
            """UPDATE cita c
               INNER JOIN consulta_clinica cc ON cc.id_cita = c.id_cita
               SET c.estado = %s
               WHERE cc.id_consulta_clinica = %s AND c.estado = %s""",
            ("Programada", id_consulta_clinica, "Pendiente")
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=400, detail="La cita no está pendiente o no existe.")
    return {"mensaje": "Cita confirmada y programada correctamente"}


@router.put("/consulta_clinica/{id_consulta_clinica}/cancelar")
def cancelar_cita(id_consulta_clinica: int, conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
        sql = """
        UPDATE cita c
        INNER JOIN consulta_clinica cc
            ON cc.id_cita = c.id_cita

        SET c.estado = %s

        WHERE cc.id_consulta_clinica = %s
        """
        cursor.execute(
            sql,
            ("Cancelada", id_consulta_clinica)
        )
    return {"mensaje": "Cita cancelada correctamente"}


