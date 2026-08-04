from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/asistencia", tags=["Asistencia"])

@router.post("/", response_model=schemas.AsistenciaResponse, status_code=201)
def crear_asistencia(asistencia: schemas.AsistenciaCreate, db: Session = Depends(get_db)):
    if not db.get(models.Empleado, asistencia.ID_Empleado):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    if asistencia.ID_Ubicacion and not db.get(models.Ubicacion, asistencia.ID_Ubicacion):
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    nuevo_registro = models.Asistencia(**asistencia.model_dump())
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro

@router.get("/", response_model=List[schemas.AsistenciaResponse])
def obtener_asistencias(id_empleado: Optional[int] = None, fecha: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Asistencia)
    if id_empleado is not None:
        query = query.filter(models.Asistencia.ID_Empleado == id_empleado)
    if fecha is not None:
        query = query.filter(models.Asistencia.Fecha == fecha)
    return query.all()

@router.get("/{asistencia_id}", response_model=schemas.AsistenciaResponse)
def obtener_asistencia(asistencia_id: int, db: Session = Depends(get_db)):
    asistencia = db.get(models.Asistencia, asistencia_id)
    if not asistencia:
        raise HTTPException(status_code=404, detail="Registro de asistencia no encontrado")
    return asistencia
