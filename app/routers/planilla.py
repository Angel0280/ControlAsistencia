from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from decimal import Decimal

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/planillas", tags=["Planillas"])

@router.post("/", response_model=schemas.PlanillaResponse, status_code=201)
def crear_planilla(planilla: schemas.PlanillaCreate, db: Session = Depends(get_db)):
    empleado = db.get(models.Empleado, planilla.ID_Empleado)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    total_deducciones = sum(item.Monto for item in planilla.Deducciones) if planilla.Deducciones else Decimal("0.00")
    salario_neto = (
        planilla.Salario_Bruto
        + planilla.Pago_Horas_Extras
        - planilla.Ausencias_Deduccion
        - total_deducciones
    )

    nueva_planilla = models.Planilla(
        ID_Empleado=planilla.ID_Empleado,
        Mes=planilla.Mes,
        Anio=planilla.Anio,
        Quincena=planilla.Quincena,
        Salario_Bruto=planilla.Salario_Bruto,
        Pago_Horas_Extras=planilla.Pago_Horas_Extras,
        Ausencias_Deduccion=planilla.Ausencias_Deduccion,
        Total_Deducciones=total_deducciones,
        Salario_Neto=salario_neto,
    )
    if planilla.Deducciones:
        detalles = []
        for item in planilla.Deducciones:
            if not db.get(models.TipoDeduccion, item.ID_TipoDeduccion):
                raise HTTPException(status_code=404, detail=f"Tipo de deduccion {item.ID_TipoDeduccion} no encontrado")
            detalles.append(models.PlanillaDeduccion(**item.model_dump()))
        nueva_planilla.deducciones = detalles

    db.add(nueva_planilla)
    db.commit()
    db.refresh(nueva_planilla)
    return nueva_planilla

@router.get("/", response_model=List[schemas.PlanillaResponse])
def obtener_planillas(id_empleado: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Planilla).options(joinedload(models.Planilla.deducciones))
    if id_empleado is not None:
        query = query.filter(models.Planilla.ID_Empleado == id_empleado)
    return query.all()

@router.get("/{planilla_id}", response_model=schemas.PlanillaResponse)
def obtener_planilla(planilla_id: int, db: Session = Depends(get_db)):
    planilla = (
        db.query(models.Planilla)
        .options(joinedload(models.Planilla.deducciones))
        .filter(models.Planilla.ID_Planilla == planilla_id)
        .first()
    )
    if not planilla:
        raise HTTPException(status_code=404, detail="Planilla no encontrada")
    return planilla
