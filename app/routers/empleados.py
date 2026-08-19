from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/api/empleados",
    tags=["Empleados"],
)

def _enrich_empleado(emp: models.Empleado):
    return {
        "ID_Empleado": emp.ID_Empleado,
        "id_empleado": emp.ID_Empleado,
        "Numero_Empleado": emp.Numero_Empleado,
        "numero_empleado": emp.Numero_Empleado,
        "Nombre": emp.Nombre,
        "nombre": emp.Nombre,
        "Apellido": emp.Apellido,
        "apellido": emp.Apellido,
        "INSS": emp.INSS,
        "inss": emp.INSS,
        "Fecha_Contratacion": emp.Fecha_Contratacion,
        "fecha_contratacion": emp.Fecha_Contratacion,
        "Salario_Base": emp.Salario_Base,
        "salario_base": emp.Salario_Base,
        "Dias_Vacaciones_Disponibles": emp.Dias_Vacaciones_Disponibles,
        "dias_vacaciones_disponibles": emp.Dias_Vacaciones_Disponibles,
        "ID_Departamento": emp.ID_Departamento,
        "id_departamento": emp.ID_Departamento,
        "ID_Rol": emp.ID_Rol,
        "id_rol": emp.ID_Rol,
        "ID_Ubicacion": emp.ID_Ubicacion,
        "id_ubicacion": emp.ID_Ubicacion,
        "Estado": emp.Estado,
        "estado": 1 if emp.Estado else 0,
        "Entra_ID": emp.Entra_ID,
        "entra_id": emp.Entra_ID,
        "Pin_Acceso": emp.Pin_Acceso,
        "pin_acceso": emp.Pin_Acceso,
        "departamento": emp.departamento.Nombre if emp.departamento else None,
        "rol": emp.rol.Nombre_Rol if emp.rol else None,
        "ubicacion": emp.ubicacion.Nombre if emp.ubicacion else None,
    }

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
    emp_db = (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
        .filter(models.Empleado.ID_Empleado == nuevo_empleado.ID_Empleado)
        .first()
    )
    return _enrich_empleado(emp_db or nuevo_empleado)

@router.get("/", response_model=List[schemas.EmpleadoResponse])
def obtener_empleados(
    estado: Optional[int] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
    )

    if estado is not None:
        is_active = bool(estado)
        query = query.filter(models.Empleado.Estado == is_active)

    if q:
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Empleado.Nombre.ilike(search),
                models.Empleado.Apellido.ilike(search),
                models.Empleado.Numero_Empleado.ilike(search),
                models.Empleado.INSS.ilike(search),
            )
        )

    empleados = query.all()
    return [_enrich_empleado(emp) for emp in empleados]

@router.get("/{empleado_id}", response_model=schemas.EmpleadoResponse)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
        .filter(models.Empleado.ID_Empleado == empleado_id)
        .first()
    )
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return _enrich_empleado(empleado)

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
    emp_db = (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
        .filter(models.Empleado.ID_Empleado == empleado_id)
        .first()
    )
    return _enrich_empleado(emp_db or empleado)

@router.patch("/{empleado_id}/estado", response_model=schemas.EmpleadoResponse)
def cambiar_estado_empleado(empleado_id: int, payload: schemas.EmpleadoEstadoUpdate, db: Session = Depends(get_db)):
    empleado = db.get(models.Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    setattr(empleado, "Estado", bool(payload.estado))
    db.commit()
    db.refresh(empleado)
    emp_db = (
        db.query(models.Empleado)
        .options(joinedload(models.Empleado.departamento), joinedload(models.Empleado.rol), joinedload(models.Empleado.ubicacion))
        .filter(models.Empleado.ID_Empleado == empleado_id)
        .first()
    )
    return _enrich_empleado(emp_db or empleado)

@router.delete("/{empleado_id}", status_code=204)
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.get(models.Empleado, empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    db.delete(empleado)
    db.commit()

