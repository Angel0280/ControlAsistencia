from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.post("/", response_model=schemas.RolResponse, status_code=201)
def crear_rol(rol: schemas.RolCreate, db: Session = Depends(get_db)):
    nuevo_rol = models.Rol(
        Nombre_Rol=rol.Nombre_Rol,
        Responsabilidades=rol.Responsabilidades,
        Estado=rol.Estado,
    )
    if rol.Permisos:
        permisos = db.query(models.Permiso).filter(models.Permiso.ID_Permiso.in_(rol.Permisos)).all()
        nuevo_rol.permisos = permisos
    db.add(nuevo_rol)
    db.commit()
    db.refresh(nuevo_rol)
    return nuevo_rol

@router.get("/", response_model=List[schemas.RolResponse])
def obtener_roles(db: Session = Depends(get_db)):
    return db.query(models.Rol).all()

@router.get("/{rol_id}", response_model=schemas.RolResponse)
def obtener_rol(rol_id: int, db: Session = Depends(get_db)):
    rol = db.get(models.Rol, rol_id)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol

@router.post("/{rol_id}/permisos", response_model=List[schemas.PermisoResponse])
def asignar_permisos(rol_id: int, permisos_ids: List[int], db: Session = Depends(get_db)):
    rol = db.get(models.Rol, rol_id)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    permisos = db.query(models.Permiso).filter(models.Permiso.ID_Permiso.in_(permisos_ids)).all()
    rol.permisos = permisos
    db.commit()
    return rol.permisos

@router.get("/{rol_id}/permisos", response_model=List[schemas.PermisoResponse])
def listar_permisos_rol(rol_id: int, db: Session = Depends(get_db)):
    rol = db.get(models.Rol, rol_id)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol.permisos
