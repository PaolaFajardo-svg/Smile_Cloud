import pymysql
from fastapi import HTTPException
from typing import Generator

bd_link = {
    "host": "localhost",
    "database": "Smile_Cloud",
    "user": "root",
    "password": "",
    "port": 3306
}

def crear_conexion():
    """
    Crea y devuelve una conexión directa a MariaDB/MySQL.

    Se utiliza desde Flask cuando necesitamos realizar
    consultas directamente a la base de datos.
    """

    return pymysql.connect(
        **bd_link,
        cursorclass=pymysql.cursors.DictCursor
    )

def bd_conexion() -> Generator:
    conexion = None
    try:
        conexion = crear_conexion()
        yield conexion
        conexion.commit()
    except pymysql.Error as e:

        if conexion:
            conexion.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error en la base de datos: {e}"
        )
    finally:

        if conexion:
            conexion.close()