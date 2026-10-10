from fastapi import APIRouter, Depends, HTTPException
from app.database import bd_conexion
from app.schemas.historial_schema import Historial

router = APIRouter()


@router.get("/historial/{numero_documento}",response_model=list[Historial])
def obtener_historial(numero_documento: str,conexion=Depends(bd_conexion)):
    with conexion.cursor() as cursor:
        sql = """
        SELECT
            p.id_paciente,
            CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
            p.numero_documento,
            p.telefono,
            p.correo,

            cc.id_consulta_clinica,
            cc.fecha,
            cc.motivo_consulta,
            cc.enfermedad_actual,
            cc.antecedentes,
            cc.observaciones,

            CONCAT(f.nombre, ' ', f.apellido) AS especialista,

            d.descripcion AS diagnostico,

            t.nombre AS tratamiento

        FROM paciente p

        LEFT JOIN consulta_clinica cc
            ON cc.id_paciente = p.id_paciente

        LEFT JOIN funcionario f
            ON f.id_funcionario = cc.id_funcionario

        LEFT JOIN diagnostico d
            ON d.id_consulta_clinica = cc.id_consulta_clinica

        LEFT JOIN tratamiento t
            ON t.id_consulta_clinica = cc.id_consulta_clinica

        WHERE p.numero_documento = %s

        ORDER BY cc.fecha DESC
        """

        cursor.execute(sql, (numero_documento,))
        historial = cursor.fetchall()

    if not historial:
        raise HTTPException(
            status_code=404,
            detail="Paciente no encontrado"
        )

    return historial