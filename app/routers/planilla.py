from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, cast
from decimal import Decimal

from app import models, schemas
from app.database import get_db

from pydantic import BaseModel

class GenerarPlanillaRequest(BaseModel):
    mes: int
    anio: int
    quincena: Optional[int] = 1

router = APIRouter(prefix="/api/planillas", tags=["Planillas"])
router_singular = APIRouter(prefix="/api/planilla", tags=["Planillas"])

@router.post("/generar")
@router_singular.post("/generar")
def generar_planilla_periodo(payload: GenerarPlanillaRequest, db: Session = Depends(get_db)):
    empleados_activos = db.query(models.Empleado).filter(models.Empleado.Estado == True).all()

    total_bruto = Decimal("0.00")
    total_deducciones = Decimal("0.00")
    total_neto = Decimal("0.00")
    detalle = []

    # Cargar tipos de deducciones obligatorias (por ejemplo INSS laboral 7%)
    tipos_ded = db.query(models.TipoDeduccion).filter(models.TipoDeduccion.Estado == True).all()

    for emp in empleados_activos:
        salario = cast(Decimal, emp.Salario_Base) or Decimal("0.00")
        if payload.quincena:
            bruto = round(salario / Decimal("2.0"), 2)
        else:
            bruto = salario

        horas_extra = Decimal("0.00")
        ausencias = Decimal("0.00")
        ded_emp = Decimal("0.00")
        detalles_ded = []

        for td in tipos_ded:
            val_ref = cast(Decimal, td.Valor_Referencia) if td.Valor_Referencia else Decimal("0.00")
            if td.Obligatoria or td.Es_Porcentaje:
                if td.Es_Porcentaje and td.Valor_Referencia:
                    monto_ded = round(bruto * (val_ref / Decimal("100.0")), 2)
                elif td.Valor_Referencia:
                    monto_ded = val_ref
                else:
                    monto_ded = Decimal("0.00")
                
                if monto_ded > Decimal("0.00"):
                    ded_emp += monto_ded
                    detalles_ded.append(models.PlanillaDeduccion(ID_TipoDeduccion=td.ID_TipoDeduccion, Monto=monto_ded))

        neto = bruto + horas_extra - ausencias - ded_emp

        # Buscar si ya existe la planilla para este período
        existente = (
            db.query(models.Planilla)
            .filter(
                models.Planilla.ID_Empleado == emp.ID_Empleado,
                models.Planilla.Mes == payload.mes,
                models.Planilla.Anio == payload.anio,
                models.Planilla.Quincena == payload.quincena
            )
            .first()
        )

        if not existente:
            nueva_p = models.Planilla(
                ID_Empleado=emp.ID_Empleado,
                Mes=payload.mes,
                Anio=payload.anio,
                Quincena=payload.quincena,
                Salario_Bruto=bruto,
                Pago_Horas_Extras=horas_extra,
                Ausencias_Deduccion=ausencias,
                Total_Deducciones=ded_emp,
                Salario_Neto=neto,
                deducciones=detalles_ded
            )
            db.add(nueva_p)

        total_bruto += bruto
        total_deducciones += ded_emp
        total_neto += neto

        detalle.append({
            "id_empleado": emp.ID_Empleado,
            "nombre": f"{emp.Nombre} {emp.Apellido}",
            "bruto": float(bruto),
            "horas_extra": float(horas_extra),
            "ausencias": float(ausencias),
            "deducciones": float(ded_emp),
            "neto": float(neto),
        })

    try:
        db.commit()
    except Exception:
        db.rollback()

    return {
        "totales": {
            "total_empleados": len(empleados_activos),
            "bruto": float(total_bruto),
            "deducciones": float(total_deducciones),
            "neto": float(total_neto),
        },
        "detalle": detalle
    }

@router.get("/deducciones/{id_empleado}")
@router_singular.get("/deducciones/{id_empleado}")
def obtener_deducciones_empleado(id_empleado: int, db: Session = Depends(get_db)):
    empleado = db.get(models.Empleado, id_empleado)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    tipos = db.query(models.TipoDeduccion).filter(models.TipoDeduccion.Estado == True).all()
    resultado = []
    salario_base = cast(Decimal, empleado.Salario_Base)
    salario = round(salario_base / Decimal("2.0"), 2)

    for t in tipos:
        val_ref = cast(Decimal, t.Valor_Referencia) if t.Valor_Referencia else Decimal("0.00")
        if t.Es_Porcentaje and t.Valor_Referencia:
            monto = round(salario * (val_ref / Decimal("100.0")), 2)
        else:
            monto = val_ref
        
        resultado.append({
            "id_tipo": t.ID_TipoDeduccion,
            "nombre": t.Nombre,
            "tipo": t.Nombre,
            "monto": float(monto)
        })
    return resultado

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
