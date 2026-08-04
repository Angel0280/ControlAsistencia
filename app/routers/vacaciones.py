from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/vacaciones", tags=["Vacaciones"])

@router.post("/", response_model=schemas.VacacionResponse, status_code=201)
def crear_vacacion(vacacion: schemas.VacacionCreate, db: Session = Depends(get_db)):
    if not db.get(models.Empleado, vacacion.ID_Empleado):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    nueva_vacacion = models.Vacacion(**vacacion.model_dump())
    db.add(nueva_vacacion)
    db.commit()
    db.refresh(nueva_vacacion)
    return nueva_vacacion

@router.get("/", response_model=List[schemas.VacacionResponse])
def obtener_vacaciones(id_empleado: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Vacacion)
    if id_empleado is not None:
        query = query.filter(models.Vacacion.ID_Empleado == id_empleado)
    return query.all()

@router.get("/{vacacion_id}", response_model=schemas.VacacionResponse)
def obtener_vacacion(vacacion_id: int, db: Session = Depends(get_db)):
    vacacion = db.get(models.Vacacion, vacacion_id)
    if not vacacion:
        raise HTTPException(status_code=404, detail="Vacacion no encontrada")
    return vacacion
