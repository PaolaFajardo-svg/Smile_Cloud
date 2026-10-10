from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.diente_schema import diente

router = APIRouter()