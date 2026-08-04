from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/tipos_deduccion", tags=["TiposDeduccion"])

@router.post("/", response_model=schemas.TipoDeduccionResponse, status_code=201)
def crear_tipo_deduccion(tipo: schemas.TipoDeduccionCreate, db: Session = Depends(get_db)):
    nuevo_tipo = models.TipoDeduccion(**tipo.model_dump())
    db.add(nuevo_tipo)
    db.commit()
    db.refresh(nuevo_tipo)
    return nuevo_tipo

@router.get("/", response_model=List[schemas.TipoDeduccionResponse])
def obtener_tipos_deduccion(db: Session = Depends(get_db)):
    return db.query(models.TipoDeduccion).all()

@router.get("/{tipo_id}", response_model=schemas.TipoDeduccionResponse)
def obtener_tipo_deduccion(tipo_id: int, db: Session = Depends(get_db)):
    tipo = db.get(models.TipoDeduccion, tipo_id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de deduccion no encontrado")
    return tipo

@router.put("/{tipo_id}", response_model=schemas.TipoDeduccionResponse)
def actualizar_tipo_deduccion(tipo_id: int, cambios: schemas.TipoDeduccionUpdate, db: Session = Depends(get_db)):
    tipo = db.get(models.TipoDeduccion, tipo_id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de deduccion no encontrado")
    for campo, valor in cambios.model_dump(exclude_none=True).items():
        setattr(tipo, campo, valor)
    db.commit()
    db.refresh(tipo)
    return tipo

@router.delete("/{tipo_id}", status_code=204)
def eliminar_tipo_deduccion(tipo_id: int, db: Session = Depends(get_db)):
    tipo = db.get(models.TipoDeduccion, tipo_id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de deduccion no encontrado")
    db.delete(tipo)
    db.commit()
