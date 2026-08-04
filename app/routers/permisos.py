from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/permisos", tags=["Permisos"])

@router.post("/", response_model=schemas.PermisoResponse, status_code=201)
def crear_permiso(permiso: schemas.PermisoCreate, db: Session = Depends(get_db)):
    nuevo_permiso = models.Permiso(**permiso.model_dump())
    db.add(nuevo_permiso)
    db.commit()
    db.refresh(nuevo_permiso)
    return nuevo_permiso

@router.get("/", response_model=List[schemas.PermisoResponse])
def obtener_permisos(db: Session = Depends(get_db)):
    return db.query(models.Permiso).all()

@router.get("/{permiso_id}", response_model=schemas.PermisoResponse)
def obtener_permiso(permiso_id: int, db: Session = Depends(get_db)):
    permiso = db.get(models.Permiso, permiso_id)
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    return permiso

@router.put("/{permiso_id}", response_model=schemas.PermisoResponse)
def actualizar_permiso(permiso_id: int, cambios: schemas.PermisoUpdate, db: Session = Depends(get_db)):
    permiso = db.get(models.Permiso, permiso_id)
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    for campo, valor in cambios.model_dump(exclude_none=True).items():
        setattr(permiso, campo, valor)
    db.commit()
    db.refresh(permiso)
    return permiso

@router.delete("/{permiso_id}", status_code=204)
def eliminar_permiso(permiso_id: int, db: Session = Depends(get_db)):
    permiso = db.get(models.Permiso, permiso_id)
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")
    db.delete(permiso)
    db.commit()
