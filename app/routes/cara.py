from fastapi import APIRouter, Depends
from app.database import bd_conexion
from app.schemas.cara_schema import cara

router = APIRouter()

