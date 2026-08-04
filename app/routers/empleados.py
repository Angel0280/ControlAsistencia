from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/api/empleados",
    tags=["Empleados"],
)

@router.post("/", response_model=schemas.EmpleadoResponse, status_code=201)
def crear_empleado(empleado: schemas.EmpleadoCreate, db: Session = Depends(get_db)):
    if not db.get(models.Departamento, empleado.ID_Departamento):
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    if not db.get(models.Rol, empleado.ID_Rol):
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if not db.get(models.Ubicacion, empleado.ID_Ubicacion):
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")

    nuevo_empleado = models.Empleado(**empleado.model_dump())
    db.add(nuevo_empleado)
    db.commit()
    db.refresh(nuevo_empleado)
    return nuevo_empleado

@router.get("/", response_model=List[schemas.EmpleadoResponse])
def obtener_empleados(db: Session = Depends(get_db)):
    return (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
        .all()
    )

@router.get("/{empleado_id}", response_model=schemas.EmpleadoResponse)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
        .get(empleado_id)
    )
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado

@router.put("/{empleado_id}", response_model=schemas.EmpleadoResponse)
def actualizar_empleado(empleado_id: int, cambios: schemas.EmpleadoUpdate, db: Session = Depends(get_db)):
    empleado = db.get(models.Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    cambios_dict = cambios.model_dump(exclude_none=True)
    if cambios_dict.get("ID_Departamento") and not db.get(models.Departamento, cambios_dict["ID_Departamento"]):
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    if cambios_dict.get("ID_Rol") and not db.get(models.Rol, cambios_dict["ID_Rol"]):
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    if cambios_dict.get("ID_Ubicacion") and not db.get(models.Ubicacion, cambios_dict["ID_Ubicacion"]):
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    for campo, valor in cambios_dict.items():
        setattr(empleado, campo, valor)
    db.commit()
    db.refresh(empleado)
    return empleado

@router.delete("/{empleado_id}", status_code=204)
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.get(models.Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    db.delete(empleado)
    db.commit()
