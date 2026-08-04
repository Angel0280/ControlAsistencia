from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/api/departamentos",
    tags=["Departamentos"],
)

@router.post("/", response_model=schemas.DepartamentoResponse, status_code=201)
def crear_departamento(depto: schemas.DepartamentoCreate, db: Session = Depends(get_db)):
    nuevo_depto = models.Departamento(**depto.model_dump())
    db.add(nuevo_depto)
    db.commit()
    db.refresh(nuevo_depto)
    return nuevo_depto

@router.get("/", response_model=List[schemas.DepartamentoResponse])
def obtener_departamentos(db: Session = Depends(get_db)):
    return db.query(models.Departamento).all()

@router.get("/{departamento_id}", response_model=schemas.DepartamentoResponse)
def obtener_departamento(departamento_id: int, db: Session = Depends(get_db)):
    departamento = db.get(models.Departamento, departamento_id)
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    return departamento

@router.put("/{departamento_id}", response_model=schemas.DepartamentoResponse)
def actualizar_departamento(departamento_id: int, cambios: schemas.DepartamentoUpdate, db: Session = Depends(get_db)):
    departamento = db.get(models.Departamento, departamento_id)
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    for campo, valor in cambios.model_dump(exclude_none=True).items():
        setattr(departamento, campo, valor)
    db.commit()
    db.refresh(departamento)
    return departamento

@router.delete("/{departamento_id}", status_code=204)
def eliminar_departamento(departamento_id: int, db: Session = Depends(get_db)):
    departamento = db.get(models.Departamento, departamento_id)
    if not departamento:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    db.delete(departamento)
    db.commit()
