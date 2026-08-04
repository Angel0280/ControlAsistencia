from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/ubicaciones", tags=["Ubicaciones"])

@router.post("/", response_model=schemas.UbicacionResponse, status_code=201)
def crear_ubicacion(ubicacion: schemas.UbicacionCreate, db: Session = Depends(get_db)):
    nueva_ubicacion = models.Ubicacion(**ubicacion.model_dump())
    db.add(nueva_ubicacion)
    db.commit()
    db.refresh(nueva_ubicacion)
    return nueva_ubicacion

@router.get("/", response_model=List[schemas.UbicacionResponse])
def obtener_ubicaciones(db: Session = Depends(get_db)):
    return db.query(models.Ubicacion).all()

@router.get("/{ubicacion_id}", response_model=schemas.UbicacionResponse)
def obtener_ubicacion(ubicacion_id: int, db: Session = Depends(get_db)):
    ubicacion = db.get(models.Ubicacion, ubicacion_id)
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    return ubicacion

@router.put("/{ubicacion_id}", response_model=schemas.UbicacionResponse)
def actualizar_ubicacion(ubicacion_id: int, cambios: schemas.UbicacionUpdate, db: Session = Depends(get_db)):
    ubicacion = db.get(models.Ubicacion, ubicacion_id)
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    for campo, valor in cambios.model_dump(exclude_none=True).items():
        setattr(ubicacion, campo, valor)
    db.commit()
    db.refresh(ubicacion)
    return ubicacion

@router.delete("/{ubicacion_id}", status_code=204)
def eliminar_ubicacion(ubicacion_id: int, db: Session = Depends(get_db)):
    ubicacion = db.get(models.Ubicacion, ubicacion_id)
    if not ubicacion:
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    db.delete(ubicacion)
    db.commit()
